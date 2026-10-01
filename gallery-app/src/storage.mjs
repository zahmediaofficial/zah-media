// Provider contract: list(folder,cursor), file(folder,id), content(file,kind), authorisedFolder(folder).
export class GalleryStorage {
 async list(){throw new Error('Storage not configured');}
 async file(){throw new Error('Storage not configured');}
 async content(){throw new Error('Storage not configured');}
 async authorisedFolder(){throw new Error('Storage not configured');}
}
