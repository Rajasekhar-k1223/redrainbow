import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.orm import Session
from app.db.mysql import SessionLocal
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.asset import Asset
from app.models.incident import Incident
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_db():
    db: Session = SessionLocal()
    
    try:
        print("Clearing existing data...")
        db.query(Incident).delete()
        db.query(Asset).delete()
        db.query(User).delete()
        db.query(Tenant).delete()
        db.commit()

        print("Seeding database...")
        
        # 1. Create Tenant
        tenant = Tenant(
            id="tenant-1234-5678", # Use the mock ID we used in frontend
            name="Acme Corp"
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        
        # 2. Create User
        user = User(
            username="admin@acme.corp",
            email="admin@acme.corp",
            password_hash=pwd_context.hash("Admin123!"),
            role=UserRole.SUPER_ADMIN,
            tenant_id=tenant.id
        )
        db.add(user)
        db.commit()

        # 3. Create Assets
        assets = [
            Asset(asset_type="Domain", identifier="acme.corp", environment="Production", criticality="High", owner="Network Team", tenant_id=tenant.id),
            Asset(asset_type="Server", identifier="core-db-prod-01 (10.0.1.55)", environment="Production", criticality="High", owner="DBA Team", tenant_id=tenant.id),
            Asset(asset_type="Container", identifier="registry.acme.corp/api:v2.4", environment="Staging", criticality="Medium", owner="DevOps", tenant_id=tenant.id),
            Asset(asset_type="Cloud Account", identifier="AWS-Prod (88392019382)", environment="Production", criticality="High", owner="CloudSec", tenant_id=tenant.id),
            Asset(asset_type="Endpoint", identifier="DESKTOP-DEV-99", environment="Development", criticality="Low", owner="J. Doe", tenant_id=tenant.id),
        ]
        db.add_all(assets)
        db.commit()

        # 4. Create Incidents
        incidents = [
            Incident(title="Potential Data Exfiltration", severity="Critical", status="New", summary="Zeek: Large outbound data transfer detected from database subnet.", tenant_id=tenant.id),
            Incident(title="Multiple Failed SSH Logins", severity="High", status="In Progress", summary="Wazuh: Brute force attack detected on bastion host.", tenant_id=tenant.id),
            Incident(title="Misconfigured S3 Bucket", severity="Medium", status="New", summary="CloudMapper: S3 bucket 'acme-backups' allows public read access.", tenant_id=tenant.id),
        ]
        db.add_all(incidents)
        db.commit()

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
