export class GalleryRepository {
 constructor(db){this.db=db;}
 gallery(id){return this.db.prepare('SELECT * FROM galleries WHERE gallery_id=?').bind(id).first();}
 session(hash,now){return this.db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').bind(hash,now).first();}
 async saveSession(hash,id,expiry){await this.db.prepare('INSERT INTO sessions VALUES (?,?,?)').bind(hash,id,expiry).run();}
 async deleteSession(hash){await this.db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(hash).run();}
 async attempt(bucket,now){
  const row=await this.db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(bucket,now+600,now,now).first();
  return row.count<=10;
 }
 async cleanup(now){await this.db.batch([this.db.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(now),this.db.prepare('DELETE FROM attempts WHERE expires_at<=?').bind(now)]);}
}
