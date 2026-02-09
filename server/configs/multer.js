import multer, { MulterError } from 'multer';

const storage = multer.diskStorage({})

export const upload = multer({storage});

