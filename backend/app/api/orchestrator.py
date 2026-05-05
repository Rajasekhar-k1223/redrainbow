import asyncio
import os
import shutil
import docker
from typing import Optional, List
from fastapi import APIRouter, File, Form, UploadFile, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
import time
from datetime import datetime
from app.core.security import get_current_user, TokenData
from app.db.mysql import SessionLocal
from app.models.evidence import Evidence
from app.models.scan import Scan
from app.services.user_service import get_user_by_username

from app.core.config import settings
from concurrent.futures import ThreadPoolExecutor
import logging

# Configure Forensic Audit Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("redrainbow.orchestrator")

router = APIRouter(prefix="/orchestrator", tags=["orchestrator"])

# Thread pool for synchronous Docker SDK calls to avoid blocking the event loop
executor = ThreadPoolExecutor(max_workers=20)

@router.on_event("startup")
async def startup_forensic_watchdog():
    """Initializes the background mesh watchdog for mission salvage and artifact purging."""
    loop = asyncio.get_event_loop()
    loop.create_task(run_forensic_watchdog())

async def run_forensic_watchdog():
    """Background lifecycle monitor for mesh health and artifact TTL management."""
    logger.info("FORENSIC_WATCHDOG: Initializing mesh health monitor...")
    while True:
        db = SessionLocal()
        try:
            # 1. Mission Salvage: Handle zombie scans
            zombies = db.query(Scan).filter(
                Scan.status.notin_(["Completed", "Failed", "Interrupted"])
            ).all()
            for scan in zombies:
                # If updated_at is more than 2 hours ago, mark as Interrupted
                if (datetime.utcnow() - scan.updated_at).total_seconds() > 7200:
                    scan.status = "Interrupted"
                    scan.logs = (scan.logs or "") + f"[{datetime.utcnow().strftime('%H:%M:%S')}] SYSTEM: Critical timeout. Mission state neutralized by Watchdog.\n"
                    logger.warning(f"WATCHDOG: Mission {scan.scan_id} neutralized due to inactivity.")
            
            # 2. Artifact Purge: Secure wipe of old mission data from /app/uploads
            uploads_dir = "uploads/targets"
            if os.path.exists(uploads_dir):
                for filename in os.listdir(uploads_dir):
                    file_path = os.path.join(uploads_dir, filename)
                    # Secure wipe files older than 24 hours
                    if (time.time() - os.path.getmtime(file_path)) > 86400:
                        try:
                            os.remove(file_path)
                            logger.info(f"WATCHDOG: Securely wiped expired artifact: {filename}")
                        except Exception as e:
                            logger.error(f"WATCHDOG_ERROR: Failed to wipe {filename}: {e}")
            
            db.commit()
        except Exception as e:
            logger.error(f"WATCHDOG_ERROR: Loop execution failure: {e}")
        finally:
            db.close()
        
        await asyncio.sleep(600) # Run audit every 10 minutes

# Global Docker Client to avoid sub-second initialization lag on every API call
DOCKER_CLIENT = None

def get_docker_client():
    global DOCKER_CLIENT
    if DOCKER_CLIENT is None:
        try:
            DOCKER_CLIENT = docker.from_env()
        except Exception:
            # Fallback if docker daemon is unreachable temporarily
            return docker.from_env() 
    return DOCKER_CLIENT

class ScanResponse(BaseModel):
    scan_id: str
    target: str
    status: str
    message: str

def update_db_scan(scan_id: str, status: str = None, log_entry: str = None):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
        if scan:
            if status:
                scan.status = status
            if log_entry:
                scan.logs = (scan.logs or "") + log_entry + "\n"
            db.commit()
    except Exception as e:
        print(f"FAILED TO UPDATE SCAN DB: {e}")
    finally:
        db.close()

async def run_agent_phase(docker_client, container_name: str, cmd: str, scan_id: str, phase_label: str, log_msg: str):
    """Executes a single agent phase in a separate thread to maintain async loop performance."""
    update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] {phase_label}: {log_msg}")
    try:
        loop = asyncio.get_event_loop()
        agent = await loop.run_in_executor(executor, docker_client.containers.get, container_name)
        _, output = await loop.run_in_executor(executor, agent.exec_run, f"sh -c \"{cmd}\"")
        return output.decode('utf-8', errors='ignore')
    except Exception as e:
        update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] {phase_label} WARNING: Agent degraded: {e}")
        return f"AGENT_ERROR: {e}"

async def run_os_agents(scan_id: str, target: str, user_id: int, url: str = None, file_path: str = None):
    """Parallel Mesh Orchestrator - Concurrently executes non-dependent security nodes."""
    update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] INFO: Parallel Intelligence Mesh Synchronized for {target}")
    
    sha256_hash = None
    if file_path and os.path.exists(file_path):
        import hashlib
        with open(file_path, "rb") as f:
            sha256_hash = hashlib.sha256(f.read()).hexdigest()
        update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] INFO: Forensic Payload Detected. Hash: {sha256_hash[:16]}...")

    finding_description = f"# MISSION AUDIT REPORT: {target}\n"
    if sha256_hash:
        finding_description += f"**Integrity Hash (SHA-256):** `{sha256_hash}`\n\n"
    
    zap_target = url if url and url.startswith("http") else (f"http://{url}" if url else "http://localhost")
    host = target.split("//")[-1].split("/")[0]
    
    try:
        docker_client = docker.from_env()
    except Exception as e:
        update_db_scan(scan_id, status="Failed", log_entry=f"CRITICAL: Docker Daemon unreachable: {e}")
        return

    async def check_interruption():
        db = SessionLocal()
        try:
            scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
            if scan and (scan.status == "Interrupted" or scan.status == "Cancelled"):
                return True
            return False
        finally:
            db.close()

    # --- STAGE 1: Parallel Recon Gathering ---
    if await check_interruption():
        update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] SYSTEM: Mission Terminated by Operator.")
        return

    update_db_scan(scan_id, status="Mesh Active: Parallel Recon Gathering...")
    recon_tasks = [
        run_agent_phase(docker_client, "redrainbow-remnux", 
                      f"curl -sL {zap_target} | grep -oE '(src|href)=\"[^\"]+\"' | cut -d'\"' -f2 | grep -E '\\.js|\\.php|\\.sh|/api/|/v1/' | sort -u | head -n 50",
                      scan_id, "[R]", "Harvesting behaviors..."),
        run_agent_phase(docker_client, "redrainbow-exiftool",
                      f"mkdir -p /tmp/ex_aud && timeout 15 wget -r -l 1 -nd -A 'jpg,png,pdf,js,config,env' {zap_target} -P /tmp/ex_aud || true; exiftool -r /tmp/ex_aud | head -n 30",
                      scan_id, "[E]", "Metadata audit..."),
        run_agent_phase(docker_client, "redrainbow-dnsrecon",
                      f"dnsrecon -d {host} -t std || dnsrecon -d {host}",
                      scan_id, "[D]", "DNS enumeration..."),
        run_agent_phase(docker_client, "redrainbow-radare2",
                      f"target_bin=\"/app/uploads/{os.path.basename(file_path)}\" if [ -f \"/app/uploads/{os.path.basename(str(file_path))}\" ] else \"/bin/ls\"; r2 -c 'aaa; afl; iI' $target_bin | head -n 50",
                      scan_id, "[R]", "Static analysis..."),
        run_agent_phase(docker_client, "redrainbow-caine",
                      f"target_art=\"/app/uploads/{os.path.basename(file_path)}\" if [ -f \"/app/uploads/{os.path.basename(str(file_path))}\" ] else \"/etc/os-release\"; binwalk $target_art | head -n 50",
                      scan_id, "[B]", "Payload peeling...")
    ]
    recon_results = await asyncio.gather(*recon_tasks)
    
    labels = ["Behavioral Harvesting", "Metadata & Secrets", "Domain Intelligence", "Assembly Analysis", "File Extraction"]
    for label, result in zip(labels, recon_results):
        finding_description += f"### Stage: {label}\n```text\n{result}\n```\n\n"

    # --- STAGE 2: Stateful Analysis ---
    if await check_interruption():
        update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] SYSTEM: Mission Terminated by Operator.")
        return

    update_db_scan(scan_id, status="Mesh Active: Vulnerability Analysis...")
    nmap_out = await run_agent_phase(docker_client, "redrainbow-kali",
                                   f"nmap -T4 -A -v {host} | grep -v 'Read data'",
                                   scan_id, "[N]", "Port Discovery...")
    finding_description += f"### Stage: Port Discovery (Nmap)\n```text\n{nmap_out}\n```\n\n"

    vuln_words = ["ssh", "ftp", "apache", "nginx", "mysql", "redis", "smb", "rdp"]
    hits = [w for w in vuln_words if w in nmap_out.lower()]
    query = hits[0] if hits else "exploit"
    arch_out = await run_agent_phase(docker_client, "redrainbow-kali",
                                   f"searchsploit --v {query} | head -n 20",
                                   scan_id, "[A]", f"Exploit correlation...")
    finding_description += f"### Stage: Exploit Search (ArchStrike)\n```text\n{arch_out}\n```\n\n"

    # --- STAGE 3: Intensive Active Attack (OWASP ZAP) ---
    if await check_interruption():
        update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] SYSTEM: Mission Terminated by Operator.")
        return

    update_db_scan(scan_id, status="Mesh Active: Active Audit...")
    try:
        agent = await asyncio.get_event_loop().run_in_executor(executor, docker_client.containers.get, "redrainbow-sechub")
        cmd = f"zap-full-scan.py -t {zap_target} -m 1 | grep -E 'WARN|FAIL|INFO'"
        exec_res = await asyncio.get_event_loop().run_in_executor(executor, lambda: agent.exec_run(f"sh -c \"{cmd}\"", stream=True))
        zap_logs = ""
        for line in exec_res.output:
            log_line = line.decode('utf-8', errors='ignore').strip()
            if log_line:
                update_db_scan(scan_id, log_entry=f"[{datetime.utcnow().strftime('%H:%M:%S')}] ZAP: {log_line}")
                zap_logs += f"{log_line}\n"
        finding_description += f"### Stage: Active Audit (OWASP ZAP)\n```text\n{zap_logs}\n```\n\n"
    except Exception as e:
        update_db_scan(scan_id, log_entry=f"ERROR: ZAP Interrupted: {e}")

    # --- STAGE 4: Neural Synthesis & Closing ---
    update_db_scan(scan_id, status="Mesh Active: Neural Synthesis...")
    
    ai_summary = "Heuristic fallback active."
    if settings.gemini_api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"Summarize security risks for {target} based on these logs. Use a Cyber-Forensic tone:\n{finding_description[:5000]}"
            response = await asyncio.get_event_loop().run_in_executor(executor, model.generate_content, prompt)
            ai_summary = response.text
        except Exception: pass

    crit_markers = ["FAIL", "CRITICAL", "VULNERABLE", "SECRET"]
    warn_markers = ["WARN", "INTERRUPTED"]
    crit_count = sum(finding_description.upper().count(m) for m in crit_markers)
    warn_count = sum(finding_description.upper().count(m) for m in warn_markers)
    risk_score = max(5, 100 - (crit_count * 15) - (warn_count * 5))

    finding_description += f"\n### 📑 [SENTINEL-X] PARALLEL NEURAL AUDIT\n**Mission Context:** Parallel Intelligence Mesh\n**Integrity Score:** {risk_score}%\n\n**[NEURAL SUMMARY]**:\n{ai_summary}\n"
    
    db = SessionLocal()
    try:
        new_evidence = Evidence(
            title=f"Parallel Assessment: {target}",
            description=finding_description,
            evidence_type="audit_report",
            user_id=user_id,
            sha256=sha256_hash,
            severity="Critical" if crit_count > 0 else "High" if warn_count > 0 else "Info",
            forensic_data={"risk_score": risk_score, "nodes_active": 11},
            source_vector="SentinelX-Parallel-Mesh"
        )
        db.add(new_evidence)
        db.commit()
        update_db_scan(scan_id, status="Completed", log_entry="[SYSTEM] Mission Finalized. Total TTR optimized via Parallel Mesh.")
        
        # INSTANT ARTIFACT SCRUB: Remove forensic payload immediately on completion
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"PURGE: Forensic payload scrubbed post-mission: {os.path.basename(file_path)}")
            except Exception as e:
                logger.error(f"PURGE_ERROR: Post-mission scrub failed for {file_path}: {e}")
                
    except Exception as e:
        update_db_scan(scan_id, status="Failed", log_entry=f"FAULT: {e}")
    finally:
        db.close()

@router.post("/")
async def submit_target(
    background_tasks: BackgroundTasks,
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: TokenData = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        user = get_user_by_username(db, current_user.username)
        if not user: raise HTTPException(status_code=401, detail="User not found")
        user_id = user.id
        scan_id = f"SCAN-{int(time.time())}"
        target = url if url else (file.filename if file else "Unknown")
        file_path = None
        if file:
            upload_dir = "uploads/targets"
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, f"{scan_id}_{file.filename}")
            with open(file_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
        new_scan = Scan(scan_id=scan_id, target=target, status="Mesh Active", logs="", user_id=user_id)
        db.add(new_scan)
        db.commit()
    finally: db.close()

    background_tasks.add_task(lambda: asyncio.run(run_os_agents(scan_id, target, user_id, url, file_path)))
    return ScanResponse(scan_id=scan_id, target=target, status="Mesh Synchronized", message="Parallel Pipeline Injected")

@router.get("/scan/{scan_id}")
async def get_scan_status(scan_id: str, current_user: TokenData = Depends(get_current_user)):
    db = SessionLocal()
    try:
        scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
        if scan:
            return {
                "status": scan.status,
                "logs": scan.logs.strip().split("\n") if scan.logs else []
            }
        return {"status": "Not Found", "logs": []}
    finally:
        db.close()

@router.get("/active")
async def get_active_scan(current_user: TokenData = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = get_user_by_username(db, current_user.username)
        if not user: raise HTTPException(status_code=401, detail="User not found")
        scan = db.query(Scan).filter(Scan.user_id == user.id, Scan.status != "Completed", Scan.status != "Failed").order_by(Scan.created_at.desc()).first()
        if scan: return {"scan_id": scan.scan_id, "status": scan.status, "target": scan.target}
        return None
    finally: db.close()

@router.get("/all")
async def get_all_scans(current_user: TokenData = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = get_user_by_username(db, current_user.username)
        if not user: raise HTTPException(status_code=401, detail="User not found")
        return db.query(Scan).filter(Scan.user_id == user.id).order_by(Scan.id.desc()).all()
    finally: db.close()

@router.delete("/stop/{scan_id}")
async def stop_scan(scan_id: str, current_user: TokenData = Depends(get_current_user)):
    db = SessionLocal()
    try:
        user = get_user_by_username(db, current_user.username)
        scan = db.query(Scan).filter(Scan.scan_id == scan_id, Scan.user_id == user.id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Mission not found")
        
        if scan.status in ["Completed", "Failed", "Interrupted"]:
            return {"message": "Mission already finalized"}
            
        scan.status = "Interrupted"
        scan.logs = (scan.logs or "") + f"[{datetime.utcnow().strftime('%H:%M:%S')}] OPERATOR: Manual Termination Signal Injected.\n"
        db.commit()
        return {"status": "Interrupted", "message": "Termination signal sent to parallel mesh"}
    finally:
        db.close()

@router.get("/signals")
async def get_live_signals(current_user: TokenData = Depends(get_current_user)):
    """Aggregates real-time security signals from active scans and audit logs."""
    db = SessionLocal()
    try:
        user = get_user_by_username(db, current_user.username)
        # Recent active scans
        active_scans = db.query(Scan).filter(Scan.user_id == user.id).order_by(Scan.id.desc()).limit(10).all()
        
        signals = []
        for scan in active_scans:
            # Extract last few logs as 'signals'
            if scan.logs:
                log_lines = scan.logs.strip().split("\n")[-3:]
                for line in log_lines:
                    if "[" in line and "]" in line:
                        signals.append({
                            "source": scan.target,
                            "type": line.split("]")[-1].strip()[:50],
                            "severity": "High" if "CRITICAL" in line.upper() or "FAIL" in line.upper() else "Medium" if "WARN" in line.upper() else "Info",
                            "time": scan.updated_at.strftime("%H:%M:%S"),
                            "count": 1
                        })
        
        # Add audit events if MongoDB is available
        try:
            mongo_db = get_mongo_db()
            cursor = mongo_db.get_collection("audit_events").find({"user": user.username}).sort("timestamp", -1).limit(5)
            async for event in cursor:
                signals.append({
                    "source": "System-Audit",
                    "type": f"{event['method']} {event['path']}",
                    "severity": "Info",
                    "time": event['timestamp'].split("T")[-1][:8],
                    "count": 1
                })
        except: pass
        
        return signals[:15]
    finally:
        db.close()

from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/ws/{scan_id}")
async def websocket_endpoint(websocket: WebSocket, scan_id: str):
    await websocket.accept()
    last_log_count = 0
    try:
        while True:
            db = SessionLocal()
            try:
                scan = db.query(Scan).filter(Scan.scan_id == scan_id).first()
                if scan:
                    current_logs = scan.logs.strip().split("\n") if scan.logs else []
                    new_logs = current_logs[last_log_count:]
                    if new_logs or scan.status in ["Completed", "Failed"]:
                        await websocket.send_json({"status": scan.status, "logs": new_logs})
                        last_log_count = len(current_logs)
                        if scan.status in ["Completed", "Failed"]: break
                else: break
            finally: db.close()
            await asyncio.sleep(0.5)
    except WebSocketDisconnect: pass
    finally:
        try: await websocket.close()
        except: pass

async def get_node_stat_async(docker_client, name: str, role: str):
    try:
        loop = asyncio.get_event_loop()
        container = await loop.run_in_executor(executor, docker_client.containers.get, name)
        s1 = await loop.run_in_executor(executor, lambda: container.stats(stream=False))
        await asyncio.sleep(0.08)
        s2 = await loop.run_in_executor(executor, lambda: container.stats(stream=False))
        
        cpu_delta = s2['cpu_stats']['cpu_usage']['total_usage'] - s1['cpu_stats']['cpu_usage']['total_usage']
        system_delta = s2['cpu_stats']['system_cpu_usage'] - s1['cpu_stats']['system_cpu_usage']
        num_cpus = s2['cpu_stats'].get('online_cpus', 1)
        cpu_percent = (cpu_delta / system_delta) * 100.0 * num_cpus if system_delta > 0 else 0.5
        
        mem_usage = s2['memory_stats'].get('usage', 0)
        mem_limit = s2['memory_stats'].get('limit', 1)
        mem_percent = (mem_usage / mem_limit) * 100.0 if mem_limit > 0 else 1.2
        
        networks = container.attrs['NetworkSettings']['Networks']
        ip = networks.get('redrainbow_default', {}).get('IPAddress') or "172.18.0.x"
        
        return {
            "name": name.replace("redrainbow-", "").capitalize(),
            "role": role, "status": "Online",
            "cpu": round(cpu_percent, 1), "mem": round(mem_percent, 1),
            "ip": ip, "uptime": "Active"
        }
    except Exception:
        return {"name": name.replace("redrainbow-", "").capitalize(), "role": role, "status": "Offline", "cpu": 0, "mem": 0, "ip": "N/A", "uptime": "0h"}

@router.get("/nodes/stats")
async def get_nodes_stats(current_user: TokenData = Depends(get_current_user)):
    try:
        docker_client = get_docker_client()
        node_configs = [
            ("redrainbow-remnux", "R: Behavioral"), ("redrainbow-exiftool", "E: Metadata"),
            ("redrainbow-dnsrecon", "D: Domain"), ("redrainbow-radare2", "R: Assembly"),
            ("redrainbow-kali", "A: Exploit"), ("redrainbow-sentinelx", "I: Privacy"),
            ("redrainbow-kali", "N: Ports"), ("redrainbow-caine", "B: Extraction"),
            ("redrainbow-sechub", "O: Web Audit"), ("redrainbow-security-onion", "W: Traffic"),
            ("redrainbow-sentinelx", "S: Synthesis")
        ]
        tasks = [get_node_stat_async(docker_client, name, role) for name, role in node_configs]
        return await asyncio.gather(*tasks)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

class TerminalCommand(BaseModel):
    node: str
    command: str

@router.post("/terminal/exec", tags=["terminal"])
async def execute_terminal_command(
    cmd: TerminalCommand,
    current_user: TokenData = Depends(get_current_user)
):
    """Executes a live interactive command on a specific forensic agent container."""
    docker_client = get_docker_client()
    try:
        # Resolve node name (ensure it starts with 'redrainbow-')
        container_name = cmd.node if cmd.node.startswith("redrainbow-") else f"redrainbow-{cmd.node.lower()}"
        container = docker_client.containers.get(container_name)
        
        # Hardened sanitization: Block destructive operations and shell meta-characters
        # We use a regex to block any attempt to chain commands or use dangerous symbols
        import re
        
        # Block characters used for command chaining or redirection
        # Specifically: ; | & < > ` $ ( ) [ ] { } \
        # We allow space and basic alphanumeric + dashes/dots
        if re.search(r'[;\|&<>`\$\(\)\[\]\{\}\\]', cmd.command):
            return {"output": "ERROR: Command contains restricted characters (shell meta-characters are blocked).", "status": "blocked"}
            
        blocked_keywords = ["rm ", "mkfs", "dd ", "chmod", "chown", "shred", "wget ", "curl "]
        if any(b in cmd.command.lower() for b in blocked_keywords):
            return {"output": "ERROR: Command contains restricted forensic keywords.", "status": "blocked"}

        # Execute
        exec_log = f"[{datetime.utcnow().strftime('%H:%M:%S')}] {current_user.username}@rrc: {cmd.command}"
        logger.info(f"TERMINAL_AUDIT: {exec_log}")
        
        # Run command with 10s timeout
        exit_code, output = container.exec_run(f"sh -c \"{cmd.command}\"", timeout=10)
        
        return {
            "output": output.decode('utf-8', errors='ignore'),
            "status": "success" if exit_code == 0 else "failed",
            "exit_code": exit_code
        }
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail=f"Target node '{cmd.node}' is offline or not found in mesh.")
    except Exception as e:
        logger.error(f"TERMINAL_ERROR: {e}")
        return {"output": f"COMM_FAILURE: {str(e)}", "status": "error"}
