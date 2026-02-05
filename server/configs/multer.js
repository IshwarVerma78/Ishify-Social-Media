import multer, { MulterError } from 'multer';

const storage = multer.diskStorage({})

export const upload = multer({storage});

// import multer from 'multer';

// const storage = multer.memoryStorage();

// const upload = multer({ storage });

// export default upload;
