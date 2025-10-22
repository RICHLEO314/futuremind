/* eslint-disable no-console */
require('dotenv').config({ path: '.env.local' })
const express = require('express')
const path = require('path')

// Check if optional dependencies are available
let multer, cors
try {
  multer = require('multer')
  cors = require('cors')
} catch (error) {
  console.error('Missing dependencies. Please install: npm install multer cors')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = 3002

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'document': ['.pdf', '.doc', '.docx', '.txt'],
      'audio': ['.mp3', '.wav', '.m4a'],
      'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    }
    
    const ext = path.extname(file.originalname).toLowerCase()
    const uploadType = req.params.type
    
    if (allowedTypes[uploadType] && allowedTypes[uploadType].includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type for ${uploadType} upload`))
    }
  }
})

// File name sanitization
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*\s]/g, '_')  // Replace dangerous characters and spaces
    .replace(/[^\x00-\x7F]/g, '')     // Remove non-ASCII characters (including Chinese)
    .replace(/_+/g, '_')              // Merge multiple underscores
    .replace(/^_|_$/g, '')            // Remove leading and trailing underscores
    .substring(0, 100)                // Limit length
}

// Upload endpoints
app.post('/api/uploads/:type', upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params
    const file = req.file
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Sanitize filename
    const originalName = file.originalname
    const ext = path.extname(originalName)
    const baseName = path.basename(originalName, ext)
    const sanitizedName = sanitizeFilename(baseName)
    const timestamp = Date.now()
    const finalFilename = `${timestamp}_${sanitizedName}${ext}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(`${type}/${finalFilename}`, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path)

    // Save to media_asset table
    const { data: assetData, error: dbError } = await supabase
      .from('media_asset')
      .insert({
        url: urlData.publicUrl,
        type: type,
        meta: {
          originalName: originalName,
          size: file.size,
          mimetype: file.mimetype,
          filename: finalFilename
        }
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({ error: dbError.message })
    }

    res.json({
      success: true,
      data: {
        id: assetData.id,
        url: urlData.publicUrl,
        originalName: originalName,
        size: file.size,
        type: type
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'upload-server', port: PORT })
})

app.listen(PORT, () => {
  console.log(`Upload server running on http://localhost:${PORT}`)
})
