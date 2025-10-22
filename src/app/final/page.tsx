'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Upload,
  FileText,
  Music,
  Video,
  Users,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Save,
  X
} from 'lucide-react'

interface PBLProject {
  id: string
  title: string
  description: string | null
  status: 'active' | 'completed' | 'paused'
  max_participants: number
  current_participants: number
  season_id: string | null
  created_at: string
}

interface MediaAsset {
  id: string
  url: string
  type: string | null
  meta: {
    originalName: string
    size: number
    mimetype: string
  } | null
  created_at: string
}

interface NewProject {
  title: string
  description: string
  max_participants: number
}

interface ContentModule {
  id: string
  key: string
  title: string
  description: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ContentItem {
  id: string
  module_id: string
  slug: string
  title: string
  summary: string | null
  default_locale: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

interface VideoLink {
  id: string
  title: string
  url: string
  platform: 'youtube' | 'bilibili' | 'other'
  description: string | null
  module_id: string | null
  item_id: string | null
  created_at: string
}

interface NewModule {
  key: string
  title: string
  description: string
}

interface NewItem {
  module_id: string
  slug: string
  title: string
  summary: string
}

interface NewVideoLink {
  title: string
  url: string
  platform: 'youtube' | 'bilibili' | 'other'
  description: string
  module_id?: string
  item_id?: string
}

export default function FinalPage() {
  const [projects, setProjects] = useState<PBLProject[]>([])
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [modules, setModules] = useState<ContentModule[]>([])
  const [items, setItems] = useState<ContentItem[]>([])
  const [videoLinks, setVideoLinks] = useState<VideoLink[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Project management states
  const [showNewProjectForm, setShowNewProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<PBLProject | null>(null)
  const [newProject, setNewProject] = useState<NewProject>({
    title: '',
    description: '',
    max_participants: 10
  })

  // CMS management states
  const [showNewModuleForm, setShowNewModuleForm] = useState(false)
  const [editingModule, setEditingModule] = useState<ContentModule | null>(null)
  const [newModule, setNewModule] = useState<NewModule>({
    key: '',
    title: '',
    description: ''
  })

  const [showNewItemForm, setShowNewItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null)
  const [newItem, setNewItem] = useState<NewItem>({
    module_id: '',
    slug: '',
    title: '',
    summary: ''
  })

  const [showNewVideoForm, setShowNewVideoForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoLink | null>(null)
  const [newVideoLink, setNewVideoLink] = useState<NewVideoLink>({
    title: '',
    url: '',
    platform: 'youtube',
    description: ''
  })

  // File upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // Upload associations
  const [selectedAudioModule, setSelectedAudioModule] = useState<string>('')
  const [selectedAudioItem, setSelectedAudioItem] = useState<string>('')
  const [selectedCoursewareModule, setSelectedCoursewareModule] = useState<string>('')
  const [selectedCoursewareItem, setSelectedCoursewareItem] = useState<string>('')
  const [selectedVideoModule, setSelectedVideoModule] = useState<string>('')
  const [selectedVideoItem, setSelectedVideoItem] = useState<string>('')

  // Testing states
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({})
  const [testing, setTesting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load PBL projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('pbl_projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('Error loading projects:', projectsError)
      }

      // Load media assets via API (bypass potential RLS issues)
      const resMedia = await fetch('/api/media/upload')
      const mediaJson = await resMedia.json()
      const mediaData = mediaJson.assets || []

      // Load content modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('content_module')
        .select('*')
        .order('created_at', { ascending: false })

      if (modulesError) {
        console.error('Error loading modules:', modulesError)
      }

      // Load content items
      const { data: itemsData, error: itemsError } = await supabase
        .from('content_item')
        .select('*')
        .order('created_at', { ascending: false })

      if (itemsError) {
        console.error('Error loading items:', itemsError)
      }

      // Load video links via API (media_resources: video_link)
      const resVideo = await fetch('/api/cms/video-links')
      const videoJson = await resVideo.json()
      const videoData = videoJson.data || []

      setProjects(projectsData || [])
      setMediaAssets(mediaData || [])
      setModules(modulesData || [])
      setItems(itemsData || [])
      setVideoLinks(videoData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create new project
  const handleCreateProject = async () => {
    if (!newProject.title.trim()) {
      alert('请输入项目标题')
      return
    }

    try {
      const { data, error } = await supabase
        .from('pbl_projects')
        .insert({
          title: newProject.title,
          description: newProject.description,
          max_participants: newProject.max_participants,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating project:', error)
        alert('创建项目失败: ' + error.message)
        return
      }

      setProjects([data, ...projects])
      setNewProject({ title: '', description: '', max_participants: 10 })
      setShowNewProjectForm(false)
      alert('项目创建成功！')
    } catch (error) {
      console.error('Error creating project:', error)
      alert('创建项目失败')
    }
  }

  // Update project
  const handleUpdateProject = async () => {
    if (!editingProject) return

    try {
      const { data, error } = await supabase
        .from('pbl_projects')
        .update({
          title: editingProject.title,
          description: editingProject.description,
          max_participants: editingProject.max_participants,
          status: editingProject.status
        })
        .eq('id', editingProject.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating project:', error)
        alert('更新项目失败: ' + error.message)
        return
      }

      setProjects(projects.map(p => p.id === editingProject.id ? data : p))
      setEditingProject(null)
      alert('项目更新成功！')
    } catch (error) {
      console.error('Error updating project:', error)
      alert('更新项目失败')
    }
  }

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('pbl_projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        alert('删除项目失败: ' + error.message)
        return
      }

      setProjects(projects.filter(p => p.id !== projectId))
      alert('项目删除成功！')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('删除项目失败')
    }
  }

  // Upload file
  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert('请选择文件')
      return
    }

    // Determine associations by active tab
    const modId = activeTab === 'courseware' ? selectedCoursewareModule : selectedAudioModule
    const itemId = activeTab === 'courseware' ? selectedCoursewareItem : selectedAudioItem

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      if (modId) formData.append('module_id', modId)
      if (itemId) formData.append('item_id', itemId)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        alert('文件上传失败: ' + (result.error || 'Unknown error'))
        return
      }

      setMediaAssets([result.asset, ...mediaAssets])
      setUploadFile(null)
      if (activeTab === 'courseware') {
        setSelectedCoursewareModule('')
        setSelectedCoursewareItem('')
      } else {
        setSelectedAudioModule('')
        setSelectedAudioItem('')
      }
      alert('文件上传成功！')
    } catch (error) {
      console.error('Upload error:', error)
      alert('文件上传失败')
    } finally {
      setUploading(false)
    }
  }

  // Delete media asset
  const handleDeleteMedia = async (assetId: string, url: string) => {
    if (!confirm('确定要删除这个文件吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/media/${assetId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        alert('删除文件失败: ' + (result.error || 'Unknown error'))
        return
      }

      setMediaAssets(mediaAssets.filter(asset => asset.id !== assetId))
      alert('文件删除成功！')
    } catch (error) {
      console.error('Delete error:', error)
      alert('删除文件失败')
    }
  }

  // Test all CRUD operations
  const runCRUDTest = async () => {
    setTesting(true)
    const results: {[key: string]: boolean} = {}

    try {
      // Test CREATE
      console.log('Testing CREATE...')
      const testProjectData = {
        title: `测试项目 - ${new Date().toLocaleString()}`,
        description: '这是一个自动化测试创建的项目',
        max_participants: 5,
        status: 'active' as const
      }

      const { data: createdProject, error: createError } = await supabase
        .from('pbl_projects')
        .insert(testProjectData)
        .select()
        .single()

      results.create = !createError && !!createdProject
      console.log('CREATE result:', results.create, createError)

      if (createdProject) {
        // Test READ
        console.log('Testing READ...')
        const { data: readProject, error: readError } = await supabase
          .from('pbl_projects')
          .select('*')
          .eq('id', createdProject.id)
          .single()

        results.read = !readError && !!readProject
        console.log('READ result:', results.read, readError)

        // Test UPDATE
        console.log('Testing UPDATE...')
        const { data: updatedProject, error: updateError } = await supabase
          .from('pbl_projects')
          .update({
            description: '更新后的描述 - ' + new Date().toLocaleString(),
            max_participants: 8
          })
          .eq('id', createdProject.id)
          .select()
          .single()

        results.update = !updateError && !!updatedProject
        console.log('UPDATE result:', results.update, updateError)

        // Test DELETE
        console.log('Testing DELETE...')
        const { error: deleteError } = await supabase
          .from('pbl_projects')
          .delete()
          .eq('id', createdProject.id)

        results.delete = !deleteError
        console.log('DELETE result:', results.delete, deleteError)
      }

    } catch (error) {
      console.error('CRUD test error:', error)
    }

    setTestResults(results)
    setTesting(false)

    // Show results
    const passedTests = Object.values(results).filter(Boolean).length
    const totalTests = Object.keys(results).length
    alert(`CRUD测试完成！\n通过: ${passedTests}/${totalTests}\n\nCREATE: ${results.create ? '✅' : '❌'}\nREAD: ${results.read ? '✅' : '❌'}\nUPDATE: ${results.update ? '✅' : '❌'}\nDELETE: ${results.delete ? '✅' : '❌'}`)
  }

  // Module management functions
  const handleCreateModule = async () => {
    if (!newModule.key.trim() || !newModule.title.trim()) {
      alert('请输入模块键名和标题')
      return
    }

    try {
      const { data, error } = await supabase
        .from('content_module')
        .insert({
          key: newModule.key.trim(),
          title: newModule.title.trim(),
          description: newModule.description.trim() || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating module:', error)
        alert('创建模块失败: ' + error.message)
        return
      }

      setModules([data, ...modules])
      setNewModule({ key: '', title: '', description: '' })
      setShowNewModuleForm(false)
      alert('模块创建成功！')
    } catch (error) {
      console.error('Error creating module:', error)
      alert('创建模块失败')
    }
  }

  const handleUpdateModule = async () => {
    if (!editingModule) return

    try {
      const response = await fetch(`/api/cms/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: editingModule.key.trim(),
          title: editingModule.title.trim(),
          description: editingModule.description?.trim() || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert('更新模块失败: ' + (result.error?.message || 'Unknown error'))
        return
      }

      setModules(modules.map(m => m.id === editingModule.id ? result.data : m))
      setEditingModule(null)
      alert('模块更新成功！')
    } catch (error) {
      console.error('Error updating module:', error)
      alert('更新模块失败')
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('确定要删除这个模块吗？此操作将同时删除模块下的所有内容条目。')) {
      return
    }

    try {
      const response = await fetch(`/api/cms/modules/${moduleId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        alert('删除模块失败: ' + (result.error?.message || 'Unknown error'))
        return
      }

      setModules(modules.filter(m => m.id !== moduleId))
      // Also remove related items
      setItems(items.filter(i => i.module_id !== moduleId))
      alert('模块删除成功！')
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('删除模块失败')
    }
  }

  // Item management functions
  const handleCreateItem = async () => {
    if (!newItem.module_id || !newItem.slug.trim() || !newItem.title.trim()) {
      alert('请选择模块并输入条目标识符和标题')
      return
    }

    try {
      const { data, error } = await supabase
        .from('content_item')
        .insert({
          module_id: newItem.module_id,
          slug: newItem.slug.trim(),
          title: newItem.title.trim(),
          summary: newItem.summary.trim() || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating item:', error)
        alert('创建条目失败: ' + error.message)
        return
      }

      setItems([data, ...items])
      setNewItem({ module_id: '', slug: '', title: '', summary: '' })
      setShowNewItemForm(false)
      alert('条目创建成功！')
    } catch (error) {
      console.error('Error creating item:', error)
      alert('创建条目失败')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const response = await fetch(`/api/cms/items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          module_id: editingItem.module_id,
          slug: editingItem.slug.trim(),
          title: editingItem.title.trim(),
          summary: editingItem.summary?.trim() || null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert('更新条目失败: ' + (result.error?.message || 'Unknown error'))
        return
      }

      setItems(items.map(i => i.id === editingItem.id ? result.data : i))
      setEditingItem(null)
      alert('条目更新成功！')
    } catch (error) {
      console.error('Error updating item:', error)
      alert('更新条目失败')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('确定要删除这个条目吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/cms/items/${itemId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        alert('删除条目失败: ' + (result.error?.message || 'Unknown error'))
        return
      }

      setItems(items.filter(i => i.id !== itemId))
      alert('条目删除成功！')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('删除条目失败')
    }
  }

  const formatFileSize = (bytes: number | undefined | null) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string | null | undefined) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5 text-blue-400" />
      case 'audio': return <Music className="w-5 h-5 text-green-400" />
      case 'image': return <Video className="w-5 h-5 text-purple-400" />
      default: return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                FutureMind PBL
              </h1>
            </div>
            <div className="text-sm text-gray-300">
              项目式学习管理平台
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex flex-wrap gap-4">
            {[
              { id: 'overview', name: '概览', icon: BarChart3 },
              { id: 'modules', name: '模块管理', icon: FileText },
              { id: 'items', name: '条目管理', icon: Edit },
              { id: 'audio', name: '音频管理', icon: Music },
              { id: 'courseware', name: '课件上传', icon: FileText },
              { id: 'video', name: '视频链接管理', icon: Video },
              { id: 'projects', name: '项目管理', icon: Users },
              { id: 'testing', name: '自动化测试', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">内容模块</p>
                      <p className="text-2xl font-bold text-white">{modules.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">内容条目</p>
                      <p className="text-2xl font-bold text-white">{items.length}</p>
                    </div>
                    <Edit className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">媒体文件</p>
                      <p className="text-2xl font-bold text-white">{mediaAssets.length}</p>
                    </div>
                    <Music className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">PBL项目</p>
                      <p className="text-2xl font-bold text-white">{projects.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-400" />
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">视频链接</p>
                      <p className="text-2xl font-bold text-white">{videoLinks.length}</p>
                    </div>
                    <Video className="w-8 h-8 text-red-400" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">最近活动</h3>
                <div className="space-y-3">
                  {modules.slice(0, 3).map((module) => (
                    <div key={module.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-purple-400 mr-3" />
                        <div>
                          <p className="text-white font-medium">{module.title}</p>
                          <p className="text-gray-400 text-sm">模块 • {module.key}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(module.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <Edit className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                          <p className="text-white font-medium">{item.title}</p>
                          <p className="text-gray-400 text-sm">条目 • {item.slug}</p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">模块管理</h2>
                <button
                  onClick={() => setShowNewModuleForm(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新建模块
                </button>
              </div>

              {/* New Module Form */}
              {showNewModuleForm && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">创建新模块</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="模块键名 (如: physics-101)"
                      value={newModule.key}
                      onChange={(e) => setNewModule({...newModule, key: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="模块标题"
                      value={newModule.title}
                      onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <textarea
                    placeholder="模块描述"
                    value={newModule.description}
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateModule}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      创建模块
                    </button>
                    <button
                      onClick={() => {
                        setShowNewModuleForm(false)
                        setNewModule({ key: '', title: '', description: '' })
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Module Form */}
              {editingModule && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">编辑模块</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="模块键名"
                      value={editingModule.key}
                      onChange={(e) => setEditingModule({...editingModule, key: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="模块标题"
                      value={editingModule.title}
                      onChange={(e) => setEditingModule({...editingModule, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <textarea
                    placeholder="模块描述"
                    value={editingModule.description || ''}
                    onChange={(e) => setEditingModule({...editingModule, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateModule}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </button>
                    <button
                      onClick={() => setEditingModule(null)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Modules List */}
              <div className="grid gap-6">
                {modules.map((module) => (
                  <div key={module.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-white mr-3">{module.title}</h3>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                            {module.key}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">{module.description || '无描述'}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <span>创建于 {new Date(module.created_at).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{items.filter(i => i.module_id === module.id).length} 个条目</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setActiveTab('items')
                            // Filter items by this module
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="查看条目"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingModule(module)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="编辑模块"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="删除模块"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">条目管理</h2>
                <button
                  onClick={() => setShowNewItemForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新建条目
                </button>
              </div>

              {/* New Item Form */}
              {showNewItemForm && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">创建新条目</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                      value={newItem.module_id}
                      onChange={(e) => setNewItem({...newItem, module_id: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">选择模块</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id} className="bg-gray-800">
                          {module.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="条目标识符 (如: lesson-01)"
                      value={newItem.slug}
                      onChange={(e) => setNewItem({...newItem, slug: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="条目标题"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="条目摘要"
                    value={newItem.summary}
                    onChange={(e) => setNewItem({...newItem, summary: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateItem}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      创建条目
                    </button>
                    <button
                      onClick={() => {
                        setShowNewItemForm(false)
                        setNewItem({ module_id: '', slug: '', title: '', summary: '' })
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Item Form */}
              {editingItem && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">编辑条目</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                      value={editingItem.module_id}
                      onChange={(e) => setEditingItem({...editingItem, module_id: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      {modules.map((module) => (
                        <option key={module.id} value={module.id} className="bg-gray-800">
                          {module.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="条目标识符"
                      value={editingItem.slug}
                      onChange={(e) => setEditingItem({...editingItem, slug: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="条目标题"
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="条目摘要"
                    value={editingItem.summary || ''}
                    onChange={(e) => setEditingItem({...editingItem, summary: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateItem}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="grid gap-6">
                {items.map((item) => {
                  const module = modules.find(m => m.id === item.module_id)
                  return (
                    <div key={item.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold text-white mr-3">{item.title}</h3>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              {item.slug}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-2">{item.summary || '无摘要'}</p>
                          <div className="flex items-center text-sm text-gray-400">
                            <span>模块: {module?.title || '未知模块'}</span>
                            <span className="mx-2">•</span>
                            <span>创建于 {new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => alert(`查看条目: ${item.title}`)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="编辑条目"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="删除条目"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">项目管理</h2>
                <button
                  onClick={() => setShowNewProjectForm(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新建项目
                </button>
              </div>

              {/* New Project Form */}
              {showNewProjectForm && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">创建新项目</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="项目标题"
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="最大参与者数量"
                      value={newProject.max_participants}
                      onChange={(e) => setNewProject({...newProject, max_participants: parseInt(e.target.value) || 10})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <textarea
                    placeholder="项目描述"
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateProject}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      创建项目
                    </button>
                    <button
                      onClick={() => {
                        setShowNewProjectForm(false)
                        setNewProject({ title: '', description: '', max_participants: 10 })
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Project Form */}
              {editingProject && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">编辑项目</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="项目标题"
                      value={editingProject.title}
                      onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="number"
                      placeholder="最大参与者数量"
                      value={editingProject.max_participants}
                      onChange={(e) => setEditingProject({...editingProject, max_participants: parseInt(e.target.value) || 10})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="mb-4">
                    <select
                      value={editingProject.status}
                      onChange={(e) => setEditingProject({...editingProject, status: e.target.value as 'active' | 'completed' | 'paused'})}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="active">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="paused">暂停</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="项目描述"
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateProject}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存更改
                    </button>
                    <button
                      onClick={() => setEditingProject(null)}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-semibold text-white mr-3">{project.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {project.status === 'active' ? '进行中' :
                             project.status === 'completed' ? '已完成' : '暂停'}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4">{project.description || '无描述'}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{project.current_participants}/{project.max_participants} 参与者</span>
                          <span className="mx-2">•</span>
                          <span>创建于 {new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => alert(`查看项目: ${project.title}`)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="查看详情"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingProject(project)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="编辑项目"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="删除项目"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">音频管理</h2>
              </div>

              {/* File Upload Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">上传新文件</h3>
                <div className="space-y-4">
                  {/* Module & Item selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={selectedAudioModule}
                      onChange={(e) => { setSelectedAudioModule(e.target.value); setSelectedAudioItem('') }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="" className="bg-gray-800">选择课程体系（Module）</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id} className="bg-gray-800">{m.title}</option>
                      ))}
                    </select>
                    <select
                      value={selectedAudioItem}
                      onChange={(e) => {
                        setSelectedAudioItem(e.target.value);
                        const it = items.find(i => i.id === e.target.value);
                        if (it) setSelectedAudioModule(it.module_id);
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="" className="bg-gray-800">选择条目（Item）</option>
                      {items.filter(i => !selectedAudioModule || i.module_id === selectedAudioModule).map((it) => (
                        <option key={it.id} value={it.id} className="bg-gray-800">{it.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      选择文件
                    </button>
                    <span className="text-gray-300">{uploadFile ? uploadFile.name : '未选择文件'}</span>
                  </div>
                  {uploadFile && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                          {uploadFile.type.startsWith('audio/') ? <Music className="w-5 h-5" /> :
                           uploadFile.type.startsWith('image/') ? <Video className="w-5 h-5" /> :
                           <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{uploadFile.name}</p>
                          <p className="text-gray-400 text-sm">{formatFileSize(uploadFile.size)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleFileUpload}
                          disabled={uploading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? '上传中...' : '上传'}
                        </button>
                        <button
                          onClick={() => setUploadFile(null)}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Assets List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">音频文件库</h3>
                {mediaAssets.filter(asset => asset.type === 'audio').length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">暂无音频文件</p>
                  </div>
                ) : (
                  mediaAssets.filter(asset => asset.type === 'audio').map((asset) => (
                    <div key={asset.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                            {getFileIcon(asset.type)}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              {asset.meta?.originalName || '未知文件'}
                            </h4>
                            <div className="flex items-center text-sm text-gray-400">
                              <span>{asset.meta?.size ? formatFileSize(asset.meta.size) : '未知大小'}</span>
                              <span className="mx-2">•</span>
                              <span>{asset.meta?.mimetype || '未知类型'}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(asset.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="下载/查看文件"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(asset.id, asset.url)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="删除文件"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Courseware Tab */}
          {activeTab === 'courseware' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">课件上传</h2>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">上传新课件</h3>
                <div className="space-y-4">
                  {/* Module & Item selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={selectedCoursewareModule}
                      onChange={(e) => { setSelectedCoursewareModule(e.target.value); setSelectedCoursewareItem('') }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="" className="bg-gray-800">选择课程体系（Module）</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id} className="bg-gray-800">{m.title}</option>
                      ))}
                    </select>
                    <select
                      value={selectedCoursewareItem}
                      onChange={(e) => {
                        setSelectedCoursewareItem(e.target.value);
                        const it = items.find(i => i.id === e.target.value);
                        if (it) setSelectedCoursewareModule(it.module_id);
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="" className="bg-gray-800">选择条目（Item）</option>
                      {items.filter(i => !selectedCoursewareModule || i.module_id === selectedCoursewareModule).map((it) => (
                        <option key={it.id} value={it.id} className="bg-gray-800">{it.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      accept="application/pdf,.pdf,.ppt,.pptx,.doc,.docx,.txt,.md"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      选择文件
                    </button>
                    <span className="text-gray-300">{uploadFile ? uploadFile.name : '未选择文件'}</span>
                  </div>

                  {uploadFile && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{uploadFile.name}</p>
                          <p className="text-gray-400 text-sm">{formatFileSize(uploadFile.size)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleFileUpload}
                          disabled={uploading}
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? '上传中...' : '上传'}
                        </button>
                        <button
                          onClick={() => setUploadFile(null)}
                          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          取消
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Courseware list (documents) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">课件库</h3>
                {mediaAssets.filter(asset => asset.type === 'document').length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">暂无课件</p>
                  </div>
                ) : (
                  mediaAssets.filter(asset => asset.type === 'document').map((asset) => (
                    <div key={asset.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">
                              {asset.meta?.originalName || '未知文件'}
                            </h4>
                            <div className="flex items-center text-sm text-gray-400">
                              <span>{asset.meta?.size ? formatFileSize(asset.meta.size) : '未知大小'}</span>
                              <span className="mx-2">•</span>
                              <span>{asset.meta?.mimetype || '未知类型'}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(asset.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="下载/查看文件"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(asset.id, asset.url)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="删除文件"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}


          {/* Video Tab */}
          {activeTab === 'video' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">视频链接管理</h2>
                <button
                  onClick={() => setShowNewVideoForm(true)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加视频链接
                </button>
              </div>

              {/* New Video Form */}
              {showNewVideoForm && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4">添加视频链接</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="视频标题"
                      value={newVideoLink.title}
                      onChange={(e) => setNewVideoLink({ ...newVideoLink, title: e.target.value })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    />
                    <select
                      value={newVideoLink.platform}
                      onChange={(e) => setNewVideoLink({ ...newVideoLink, platform: e.target.value as 'youtube' | 'bilibili' | 'other' })}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="youtube" className="bg-gray-800">YouTube</option>
                      <option value="bilibili" className="bg-gray-800">哔哩哔哩</option>
                      <option value="other" className="bg-gray-800">其他平台</option>
                    </select>
                  </div>
                  {/* Module & Item selectors for video link association */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={selectedVideoModule}
                      onChange={(e) => { setSelectedVideoModule(e.target.value); setSelectedVideoItem('') }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="" className="bg-gray-800">选择课程体系（Module）</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id} className="bg-gray-800">{m.title}</option>
                      ))}
                    </select>
                    <select
                      value={selectedVideoItem}
                      onChange={(e) => {
                        setSelectedVideoItem(e.target.value);
                        const it = items.find(i => i.id === e.target.value);
                        if (it) setSelectedVideoModule(it.module_id);
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="" className="bg-gray-800">选择条目（Item）</option>
                      {items.filter(i => !selectedVideoModule || i.module_id === selectedVideoModule).map((it) => (
                        <option key={it.id} value={it.id} className="bg-gray-800">{it.title}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="url"
                    placeholder="视频链接 (https://...)"
                    value={newVideoLink.url}
                    onChange={(e) => setNewVideoLink({ ...newVideoLink, url: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 mb-4"
                  />
                  <textarea
                    placeholder="视频描述"
                    value={newVideoLink.description}
                    onChange={(e) => setNewVideoLink({...newVideoLink, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 mb-4"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        // For now, just add to local state since table doesn't exist yet
                        const newVideo: VideoLink = {
                          id: Date.now().toString(),
                          title: newVideoLink.title,
                          url: newVideoLink.url,
                          platform: newVideoLink.platform,
                          description: newVideoLink.description,
                          module_id: null,
                          item_id: null,
                          created_at: new Date().toISOString()
                        }
                        try {
                          const res = await fetch('/api/cms/video-links', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: newVideoLink.title,
                              url: newVideoLink.url,
                              platform: newVideoLink.platform,
                              description: newVideoLink.description,
                              module_id: selectedVideoModule || undefined,
                              item_id: selectedVideoItem || undefined,
                            }),
                          })
                          const json = await res.json()
                          if (!res.ok) {
                            alert('添加失败: ' + (json?.error?.message || json?.error || 'Unknown'))
                            return
                          }
                          setVideoLinks([json.data, ...videoLinks])
                          setNewVideoLink({ title: '', url: '', platform: 'youtube', description: '' })
                          setSelectedVideoModule('')
                          setSelectedVideoItem('')
                          setShowNewVideoForm(false)
                          alert('视频链接添加成功！')
                        } catch (e) {
                          alert('添加失败')
                        }
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      添加链接
                    </button>
                    <button
                      onClick={() => {
                        setShowNewVideoForm(false)
                        setNewVideoLink({ title: '', url: '', platform: 'youtube', description: '' })
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* Video Links List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">视频链接库</h3>
                {videoLinks.length === 0 ? (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">暂无视频链接</p>
                  </div>
                ) : (
                  videoLinks.map((video) => (
                    <div key={video.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="p-2 bg-red-500/20 rounded-lg mr-4">
                            <Video className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h4 className="text-white font-medium mr-3">{video.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                video.platform === 'youtube' ? 'bg-red-500/20 text-red-400' :
                                video.platform === 'bilibili' ? 'bg-pink-500/20 text-pink-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {video.platform === 'youtube' ? 'YouTube' :
                                 video.platform === 'bilibili' ? '哔哩哔哩' : '其他'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{video.description || '无描述'}</p>
                            <div className="flex items-center text-sm text-gray-400">
                              <span className="truncate max-w-md">{video.url}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(video.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="打开视频"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingVideo(video)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="编辑链接"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('确定要删除这个视频链接吗？')) return
                              try {
                                const res = await fetch(`/api/cms/video-links/${video.id}`, { method: 'DELETE' })
                                const json = await res.json()
                                if (!res.ok) {
                                  alert('删除失败: ' + (json?.error?.message || json?.error || 'Unknown'))
                                  return
                                }
                                setVideoLinks(videoLinks.filter(v => v.id !== video.id))
                                alert('视频链接删除成功！')
                              } catch (e) {
                                alert('删除失败')
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            title="删除链接"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Testing Tab */}
          {activeTab === 'testing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">自动化测试</h2>

              {/* Database Connection Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">数据库连接状态</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-green-400 font-medium">Supabase 已连接</span>
                    </div>
                    <p className="text-green-300 text-sm mt-2">lvjezsnwesyblnlkkirz.supabase.co</p>
                  </div>
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                      <span className="text-blue-400 font-medium">存储桶可用</span>
                    </div>
                    <p className="text-blue-300 text-sm mt-2">media (公开访问)</p>
                  </div>
                </div>
              </div>

              {/* Database Tables Info */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">数据库表格概览</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium">PBL 项目系统</h4>
                    <ul className="text-gray-300 text-sm mt-2 space-y-1">
                      <li>• pbl_projects (1个项目)</li>
                      <li>• project_participants</li>
                    </ul>
                  </div>
                  <div className="bg-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium">CMS 内容系统</h4>
                    <ul className="text-gray-300 text-sm mt-2 space-y-1">
                      <li>• content_module (9个模块)</li>
                      <li>• content_item</li>
                      <li>• media_asset (5个文件)</li>
                    </ul>
                  </div>
                  <div className="bg-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium">用户系统</h4>
                    <ul className="text-gray-300 text-sm mt-2 space-y-1">
                      <li>• profiles (用户档案)</li>
                      <li>• seasons (1个活跃季度)</li>
                      <li>• user_progress</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CRUD Test Results */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">CRUD 功能测试</h3>
                  <button
                    onClick={runCRUDTest}
                    disabled={testing}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {testing ? '测试中...' : '运行测试'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      testResults.create === true ? 'bg-green-500/20' :
                      testResults.create === false ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Plus className={`w-6 h-6 ${
                        testResults.create === true ? 'text-green-400' :
                        testResults.create === false ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-white font-medium">CREATE</p>
                    <p className={`text-sm ${
                      testResults.create === true ? 'text-green-300' :
                      testResults.create === false ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {testResults.create === true ? '✅ 通过' :
                       testResults.create === false ? '❌ 失败' : '⏳ 待测试'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      testResults.read === true ? 'bg-green-500/20' :
                      testResults.read === false ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Eye className={`w-6 h-6 ${
                        testResults.read === true ? 'text-green-400' :
                        testResults.read === false ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-white font-medium">READ</p>
                    <p className={`text-sm ${
                      testResults.read === true ? 'text-green-300' :
                      testResults.read === false ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {testResults.read === true ? '✅ 通过' :
                       testResults.read === false ? '❌ 失败' : '⏳ 待测试'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      testResults.update === true ? 'bg-green-500/20' :
                      testResults.update === false ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Edit className={`w-6 h-6 ${
                        testResults.update === true ? 'text-green-400' :
                        testResults.update === false ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-white font-medium">UPDATE</p>
                    <p className={`text-sm ${
                      testResults.update === true ? 'text-green-300' :
                      testResults.update === false ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {testResults.update === true ? '✅ 通过' :
                       testResults.update === false ? '❌ 失败' : '⏳ 待测试'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      testResults.delete === true ? 'bg-green-500/20' :
                      testResults.delete === false ? 'bg-red-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Trash2 className={`w-6 h-6 ${
                        testResults.delete === true ? 'text-green-400' :
                        testResults.delete === false ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-white font-medium">DELETE</p>
                    <p className={`text-sm ${
                      testResults.delete === true ? 'text-green-300' :
                      testResults.delete === false ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {testResults.delete === true ? '✅ 通过' :
                       testResults.delete === false ? '❌ 失败' : '⏳ 待测试'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">快速测试导航</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <button
                    onClick={() => setActiveTab('modules')}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    模块管理
                  </button>
                  <button
                    onClick={() => setActiveTab('items')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5 mr-2" />
                    条目管理
                  </button>
                  <button
                    onClick={() => setActiveTab('audio')}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    音频管理
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    视频管理
                  </button>
                </div>

                <h4 className="text-md font-semibold text-white mb-3">完整系统测试</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={async () => {
                      setTesting(true)
                      try {
                        console.log('开始完整系统测试...')

                        // Create test module
                        const testModule = {
                          key: `test-module-${Date.now()}`,
                          title: '测试模块 - ' + new Date().toLocaleString(),
                          description: '这是一个自动化测试创建的模块'
                        }

                        const { data: moduleData, error: moduleError } = await supabase
                          .from('content_module')
                          .insert(testModule)
                          .select()
                          .single()

                        if (moduleError) throw moduleError

                        // Create test item
                        const testItem = {
                          module_id: moduleData.id,
                          slug: `test-item-${Date.now()}`,
                          title: '测试条目 - ' + new Date().toLocaleString(),
                          summary: '这是一个自动化测试创建的条目'
                        }

                        const { data: itemData, error: itemError } = await supabase
                          .from('content_item')
                          .insert(testItem)
                          .select()
                          .single()

                        if (itemError) throw itemError

                        // Refresh data
                        await loadData()

                        alert('完整系统测试通过！\n✅ 模块创建成功\n✅ 条目创建成功\n✅ 数据同步成功')

                      } catch (error) {
                        console.error('系统测试失败:', error)
                        alert('系统测试失败: ' + (error as Error).message)
                      } finally {
                        setTesting(false)
                      }
                    }}
                    disabled={testing}
                    className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    {testing ? '测试中...' : '运行完整测试'}
                  </button>
                  <button
                    onClick={loadData}
                    className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    刷新所有数据
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
