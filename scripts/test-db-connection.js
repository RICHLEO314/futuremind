const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔗 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  
  try {
    // Test 1: List all tables
    console.log('\n📋 Checking database tables...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError)
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name))
    }

    // Test 2: Check PBL projects
    console.log('\n🎯 Checking PBL projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('pbl_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
    } else {
      console.log(`✅ Found ${projects.length} PBL projects:`)
      projects.forEach(p => {
        console.log(`  - ${p.title} (${p.status}) - ${p.current_participants}/${p.max_participants} participants`)
      })
    }

    // Test 3: Check media assets
    console.log('\n📁 Checking media assets...')
    const { data: media, error: mediaError } = await supabase
      .from('media_asset')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (mediaError) {
      console.error('❌ Error fetching media:', mediaError)
    } else {
      console.log(`✅ Found ${media.length} media assets:`)
      media.forEach(m => {
        const meta = m.meta || {}
        console.log(`  - ${meta.originalName || 'Unknown'} (${m.type}) - ${meta.size ? Math.round(meta.size/1024) + 'KB' : 'Unknown size'}`)
      })
    }

    // Test 4: Check content modules
    console.log('\n📚 Checking content modules...')
    const { data: modules, error: modulesError } = await supabase
      .from('content_module')
      .select('*')
      .order('created_at', { ascending: false })

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError)
    } else {
      console.log(`✅ Found ${modules.length} content modules:`)
      modules.forEach(m => {
        console.log(`  - ${m.title} (${m.key})`)
      })
    }

    // Test 5: Check seasons
    console.log('\n🌟 Checking seasons...')
    const { data: seasons, error: seasonsError } = await supabase
      .from('seasons')
      .select('*')
      .order('created_at', { ascending: false })

    if (seasonsError) {
      console.error('❌ Error fetching seasons:', seasonsError)
    } else {
      console.log(`✅ Found ${seasons.length} seasons:`)
      seasons.forEach(s => {
        console.log(`  - ${s.title} (${s.is_active ? 'Active' : 'Inactive'})`)
      })
    }

    // Test 6: Test storage bucket
    console.log('\n🗄️ Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ Error fetching buckets:', bucketsError)
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`)
      buckets.forEach(b => {
        console.log(`  - ${b.name} (${b.public ? 'Public' : 'Private'})`)
      })
    }

    console.log('\n🎉 Database connection test completed!')

  } catch (error) {
    console.error('❌ Connection test failed:', error)
  }
}

// Test CRUD operations
async function testCRUD() {
  console.log('\n🧪 Testing CRUD operations...')

  try {
    // Create test project
    console.log('\n➕ Testing CREATE operation...')
    const { data: newProject, error: createError } = await supabase
      .from('pbl_projects')
      .insert({
        title: 'Test Project - ' + new Date().toISOString(),
        description: 'This is a test project created by the connection test script',
        max_participants: 5,
        status: 'active'
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ CREATE failed:', createError)
      return
    }
    console.log('✅ CREATE successful:', newProject.title)

    // Read the project
    console.log('\n👁️ Testing READ operation...')
    const { data: readProject, error: readError } = await supabase
      .from('pbl_projects')
      .select('*')
      .eq('id', newProject.id)
      .single()

    if (readError) {
      console.error('❌ READ failed:', readError)
    } else {
      console.log('✅ READ successful:', readProject.title)
    }

    // Update the project
    console.log('\n✏️ Testing UPDATE operation...')
    const { data: updatedProject, error: updateError } = await supabase
      .from('pbl_projects')
      .update({
        description: 'Updated description - ' + new Date().toISOString(),
        max_participants: 8
      })
      .eq('id', newProject.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ UPDATE failed:', updateError)
    } else {
      console.log('✅ UPDATE successful:', updatedProject.max_participants)
    }

    // Delete the project
    console.log('\n🗑️ Testing DELETE operation...')
    const { error: deleteError } = await supabase
      .from('pbl_projects')
      .delete()
      .eq('id', newProject.id)

    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError)
    } else {
      console.log('✅ DELETE successful')
    }

    console.log('\n🎉 CRUD operations test completed!')

  } catch (error) {
    console.error('❌ CRUD test failed:', error)
  }
}

// Run tests
async function runAllTests() {
  await testConnection()
  await testCRUD()
}

runAllTests()
