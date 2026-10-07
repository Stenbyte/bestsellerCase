import type { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import { AppError } from '../types/errors.js'
import { saveValidatedJpeg } from '../services/uploads.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1,
    fields: 0,
    parts: 1,
  },
})

function multerSingle(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err: unknown) => {
    if (!err) {
      next()
      return
    }
    if (err instanceof multer.MulterError) {
      next(
        AppError.validation(err.message, {
          code: err.code,
          field: err.field,
        }),
      )
      return
    }
    next(err)
  })
}

export function registerUploads(api: Router): void {
  api.post('/uploads', multerSingle, async (req, res, next) => {
    try {
      if (!req.file) {
        throw AppError.validation('Missing file field "file"')
      }
      const image = await saveValidatedJpeg(req.file)
      res.status(201).json({ image })
    } catch (err) {
      next(err)
    }
  })
}
