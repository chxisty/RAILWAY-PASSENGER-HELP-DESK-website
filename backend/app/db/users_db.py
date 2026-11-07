import sqlite3
import json
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List
from app.core.security import hash_password, verify_password, generate_reset_token

# Store database under data/database/railassist_users.db
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
DB_DIR = ROOT_DIR / "data" / "database"
DB_PATH = DB_DIR / "railassist_users.db"

class UsersDatabase:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._ensure_db()

    def _get_connection(self) -> sqlite3.Connection:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                    phone TEXT,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    reset_token TEXT,
                    reset_token_expiry TEXT
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    sources TEXT,
                    suggested_followups TEXT,
                    intent TEXT,
                    tools_used TEXT,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_conv ON chat_messages(conversation_id);")
            conn.commit()

    def create_user(
        self,
        full_name: str,
        email: str,
        password: str,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        full_name_clean = full_name.strip()
        phone_clean = phone.strip() if phone else None
        
        # Check if already exists
        existing = self.get_user_by_email(email_clean)
        if existing:
            raise ValueError(f"An account with email '{email_clean}' already exists.")

        user_id = str(uuid.uuid4())
        pwd_hash, salt = hash_password(password)
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (id, full_name, email, phone, password_hash, salt, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, full_name_clean, email_clean, phone_clean, pwd_hash, salt, now_iso, now_iso))
            conn.commit()

        return {
            "id": user_id,
            "full_name": full_name_clean,
            "email": email_clean,
            "phone": phone_clean,
            "created_at": now_iso
        }

    def get_user_by_email(self, email: str, include_auth: bool = False) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ? COLLATE NOCASE", (email_clean,))
            row = cursor.fetchone()
            if not row:
                return None
            data = dict(row)
            if not include_auth:
                data.pop("password_hash", None)
                data.pop("salt", None)
                data.pop("reset_token", None)
                data.pop("reset_token_expiry", None)
            return data

    def get_user_by_id(self, user_id: str, include_auth: bool = False) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return None
            data = dict(row)
            if not include_auth:
                data.pop("password_hash", None)
                data.pop("salt", None)
                data.pop("reset_token", None)
                data.pop("reset_token_expiry", None)
            return data

    def authenticate_user(self, email_or_username: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_email(email_or_username, include_auth=True)
        if not user:
            return None
        
        valid = verify_password(password, user["password_hash"], user["salt"])
        if not valid:
            return None
        
        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user["phone"],
            "created_at": user["created_at"]
        }

    def update_profile(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        updates = []
        params = []
        now_iso = datetime.now(timezone.utc).isoformat()
        
        if full_name is not None and full_name.strip():
            updates.append("full_name = ?")
            params.append(full_name.strip())
        if phone is not None:
            updates.append("phone = ?")
            params.append(phone.strip() if phone else None)
        
        if not updates:
            return user
        
        updates.append("updated_at = ?")
        params.append(now_iso)
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            conn.commit()
            
        return self.get_user_by_id(user_id)

    def change_password(self, user_id: str, old_password: str, new_password: str) -> bool:
        user = self.get_user_by_id(user_id, include_auth=True)
        if not user:
            return False
        
        if not verify_password(old_password, user["password_hash"], user["salt"]):
            return False
            
        new_hash, new_salt = hash_password(new_password)
        now_iso = datetime.now(timezone.utc).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users 
                SET password_hash = ?, salt = ?, updated_at = ?
                WHERE id = ?
            """, (new_hash, new_salt, now_iso, user_id))
            conn.commit()
            
        return True

    def create_password_reset_token(self, email: str) -> Optional[tuple[str, str]]:
        """
        Creates a password reset token for the given email.
        Returns (token, expiry_iso) or None if user not found.
        """
        user = self.get_user_by_email(email)
        if not user:
            return None
            
        token = generate_reset_token()
        expiry = datetime.now(timezone.utc) + timedelta(hours=1)
        expiry_iso = expiry.isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE users
                SET reset_token = ?, reset_token_expiry = ?
                WHERE email = ? COLLATE NOCASE
            """, (token, expiry_iso, email.strip().lower()))
            conn.commit()
            
        return token, expiry_iso

    def reset_password_with_token(self, token: str, new_password: str) -> bool:
        """
        Validates token and expiration, sets new password, and invalidates token.
        """
        if not token or not token.strip():
            return False
            
        now_iso = datetime.now(timezone.utc).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, reset_token_expiry FROM users WHERE reset_token = ?
            """, (token.strip(),))
            row = cursor.fetchone()
            if not row:
                return False
                
            expiry_str = row["reset_token_expiry"]
            if not expiry_str:
                return False
                
            try:
                expiry = datetime.fromisoformat(expiry_str)
                if datetime.now(timezone.utc) > expiry:
                    return False
            except Exception:
                return False
                
            user_id = row["id"]
            new_hash, new_salt = hash_password(new_password)
            
            cursor.execute("""
                UPDATE users
                SET password_hash = ?, salt = ?, reset_token = NULL, reset_token_expiry = NULL, updated_at = ?
                WHERE id = ?
            """, (new_hash, new_salt, now_iso, user_id))
            conn.commit()
            return True

    # =========================================================================
    # CONVERSATION & CHAT HISTORY METHODS
    # =========================================================================

    def list_conversations(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all conversations for a user, or guest conversations if user_id is None."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("""
                    SELECT c.*, 
                           (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id) as message_count,
                           (SELECT content FROM chat_messages m WHERE m.conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
                    FROM conversations c
                    WHERE c.user_id = ?
                    ORDER BY c.updated_at DESC;
                """, (user_id,))
            else:
                cursor.execute("""
                    SELECT c.*, 
                           (SELECT COUNT(*) FROM chat_messages m WHERE m.conversation_id = c.id) as message_count,
                           (SELECT content FROM chat_messages m WHERE m.conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message
                    FROM conversations c
                    ORDER BY c.updated_at DESC;
                """)
            return [dict(r) for r in cursor.fetchall()]

    def get_conversation(self, conv_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation metadata by id."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM conversations WHERE id = ?", (conv_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def create_or_touch_conversation(
        self,
        conv_id: str,
        title: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates conversation if absent or updates timestamp and title."""
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, user_id FROM conversations WHERE id = ?", (conv_id,))
            existing = cursor.fetchone()
            
            if existing:
                # Update timestamp and title if provided
                new_title = title if title and title != "New Conversation" else existing["title"]
                assigned_user = user_id or existing["user_id"]
                cursor.execute("""
                    UPDATE conversations
                    SET updated_at = ?, title = ?, user_id = ?
                    WHERE id = ?;
                """, (now_iso, new_title, assigned_user, conv_id))
                conn.commit()
                return {"id": conv_id, "title": new_title, "user_id": assigned_user, "updated_at": now_iso}
            else:
                assigned_title = title or "New Railway Enquiry"
                cursor.execute("""
                    INSERT INTO conversations (id, user_id, title, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?);
                """, (conv_id, user_id, assigned_title, now_iso, now_iso))
                conn.commit()
                return {"id": conv_id, "title": assigned_title, "user_id": user_id, "created_at": now_iso, "updated_at": now_iso}

    def delete_conversation(self, conv_id: str) -> bool:
        """Deletes a conversation and all its messages."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM chat_messages WHERE conversation_id = ?", (conv_id,))
            cursor.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
            conn.commit()
            return cursor.rowcount > 0

    def clear_all_conversations(self, user_id: Optional[str] = None) -> int:
        """Clears all conversations for user or all guest conversations."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if user_id:
                cursor.execute("""
                    DELETE FROM chat_messages 
                    WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = ?);
                """, (user_id,))
                cursor.execute("DELETE FROM conversations WHERE user_id = ?;", (user_id,))
            else:
                cursor.execute("DELETE FROM chat_messages;")
                cursor.execute("DELETE FROM conversations;")
            conn.commit()
            return cursor.rowcount

    def save_chat_message(
        self,
        conv_id: str,
        role: str,
        content: str,
        sources: Optional[List[Dict[str, Any]]] = None,
        suggested_followups: Optional[List[str]] = None,
        intent: Optional[str] = None,
        tools_used: Optional[List[str]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Saves a chat message and updates conversation updated_at."""
        now_iso = datetime.now(timezone.utc).isoformat()
        msg_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        # Ensure conversation exists
        auto_title = content[:38] + ("..." if len(content) > 38 else "") if role == "user" else None
        self.create_or_touch_conversation(conv_id, title=auto_title, user_id=user_id)

        sources_json = json.dumps(sources) if sources else None
        followups_json = json.dumps(suggested_followups) if suggested_followups else None
        tools_json = json.dumps(tools_used) if tools_used else None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO chat_messages (id, conversation_id, role, content, timestamp, sources, suggested_followups, intent, tools_used)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (msg_id, conv_id, role, content, now_iso, sources_json, followups_json, intent, tools_json))
            conn.commit()

        return {
            "id": msg_id,
            "conversation_id": conv_id,
            "role": role,
            "content": content,
            "timestamp": now_iso,
            "sources": sources or [],
            "suggested_followups": suggested_followups or [],
            "intent": intent,
            "tools_used": tools_used or []
        }

    def get_chat_messages(self, conv_id: str) -> List[Dict[str, Any]]:
        """Retrieves ordered messages for a conversation."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM chat_messages 
                WHERE conversation_id = ? 
                ORDER BY timestamp ASC;
            """, (conv_id,))
            rows = cursor.fetchall()
            
            result = []
            for r in rows:
                item = dict(r)
                if item.get("sources"):
                    try:
                        item["sources"] = json.loads(item["sources"])
                    except Exception:
                        item["sources"] = []
                else:
                    item["sources"] = []
                    
                if item.get("suggested_followups"):
                    try:
                        item["suggested_followups"] = json.loads(item["suggested_followups"])
                    except Exception:
                        item["suggested_followups"] = []
                else:
                    item["suggested_followups"] = []
                    
                if item.get("tools_used"):
                    try:
                        item["tools_used"] = json.loads(item["tools_used"])
                    except Exception:
                        item["tools_used"] = []
                else:
                    item["tools_used"] = []
                    
                result.append(item)
            return result

users_db = UsersDatabase()

