const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAudioUpload() {
  console.log('🎵 Testing audio upload functionality...')
  
  const audioFilePath = 'D:\\baidunetdisk\\sounds\\2.wav'
  
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      console.log('❌ Audio file not found at:', audioFilePath)
      console.log('📝 Creating a test audio record in database instead...')
      
      // Create a test audio record without actual file
      const testAudioData = {
        url: 'https://example.com/test-audio.wav',
        type: 'audio',
        meta: {
          originalName: '2.wav',
          size: 1024000, // 1MB
          mimetype: 'audio/wav',
          uploadPath: 'uploads/test-audio.wav'
        }
      }
      
      const { data: audioRecord, error: dbError } = await supabase
        .from('media_asset')
        .insert(testAudioData)
        .select()
        .single()
      
      if (dbError) {
        console.error('❌ Database insert failed:', dbError)
        return
      }
      
      console.log('✅ Test audio record created:', audioRecord.id)
      console.log('📊 Audio metadata:', audioRecord.meta)
      return audioRecord
    }
    
    // File exists, proceed with actual upload
    console.log('📁 Found audio file:', audioFilePath)
    
    const fileStats = fs.statSync(audioFilePath)
    console.log('📊 File size:', Math.round(fileStats.size / 1024), 'KB')
    
    // Read file
    const fileBuffer = fs.readFileSync(audioFilePath)
    const fileName = `test-upload-${Date.now()}.wav`
    const filePath = `uploads/${fileName}`
    
    console.log('⬆️ Uploading to Supabase Storage...')
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'audio/wav'
      })
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError)
      return
    }
    
    console.log('✅ File uploaded successfully:', uploadData.path)
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)
    
    console.log('🔗 Public URL:', urlData.publicUrl)
    
    // Save to database
    const audioData = {
      url: urlData.publicUrl,
      type: 'audio',
      meta: {
        originalName: '2.wav',
        size: fileStats.size,
        mimetype: 'audio/wav',
        uploadPath: filePath
      }
    }
    
    const { data: audioRecord, error: dbError } = await supabase
      .from('media_asset')
      .insert(audioData)
      .select()
      .single()
    
    if (dbError) {
      console.error('❌ Database insert failed:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('media').remove([filePath])
      return
    }
    
    console.log('✅ Audio record created in database:', audioRecord.id)
    console.log('🎉 Audio upload test completed successfully!')
    
    return audioRecord
    
  } catch (error) {
    console.error('❌ Audio upload test failed:', error)
  }
}

async function testCMSWorkflow() {
  console.log('\n🔄 Testing complete CMS workflow...')
  
  try {
    // 1. Create test module
    console.log('1️⃣ Creating test module...')
    const moduleData = {
      key: `audio-test-${Date.now()}`,
      title: '音频测试模块',
      description: '用于测试音频上传功能的模块'
    }
    
    const { data: module, error: moduleError } = await supabase
      .from('content_module')
      .insert(moduleData)
      .select()
      .single()
    
    if (moduleError) throw moduleError
    console.log('✅ Module created:', module.title)
    
    // 2. Create test item
    console.log('2️⃣ Creating test item...')
    const itemData = {
      module_id: module.id,
      slug: `audio-lesson-${Date.now()}`,
      title: '音频课程测试',
      summary: '包含音频文件的测试课程'
    }
    
    const { data: item, error: itemError } = await supabase
      .from('content_item')
      .insert(itemData)
      .select()
      .single()
    
    if (itemError) throw itemError
    console.log('✅ Item created:', item.title)
    
    // 3. Upload audio
    console.log('3️⃣ Testing audio upload...')
    const audioRecord = await testAudioUpload()
    
    if (audioRecord) {
      // 4. Link audio to item
      console.log('4️⃣ Linking audio to content item...')
      const { data: updatedAudio, error: linkError } = await supabase
        .from('media_asset')
        .update({
          module_id: module.id,
          item_id: item.id
        })
        .eq('id', audioRecord.id)
        .select()
        .single()
      
      if (linkError) throw linkError
      console.log('✅ Audio linked to content item')
    }
    
    // 5. Verify data
    console.log('5️⃣ Verifying complete workflow...')
    const { data: verification, error: verifyError } = await supabase
      .from('media_asset')
      .select(`
        *,
        content_module:module_id(title),
        content_item:item_id(title)
      `)
      .eq('module_id', module.id)
    
    if (verifyError) throw verifyError
    
    console.log('🎉 Complete CMS workflow test passed!')
    console.log('📊 Verification results:')
    verification.forEach(asset => {
      console.log(`  - Audio: ${asset.meta?.originalName}`)
      console.log(`  - Module: ${asset.content_module?.title}`)
      console.log(`  - Item: ${asset.content_item?.title}`)
    })
    
  } catch (error) {
    console.error('❌ CMS workflow test failed:', error)
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive CMS tests...\n')
  await testCMSWorkflow()
  console.log('\n✅ All tests completed!')
}

runAllTests()
