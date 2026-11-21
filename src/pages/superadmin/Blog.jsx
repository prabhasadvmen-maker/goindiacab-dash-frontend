import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  BookOpen, Plus, Pencil, Trash2, X, Loader2, RefreshCw,
  AlertCircle, CheckCircle2, Search, Eye, EyeOff, Tag, ImagePlus,
  User, Calendar, Link2, FileText,
} from 'lucide-react';
import clsx from 'clsx';
import RichTextEditor from '../../components/RichTextEditor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/admins/blogs`;

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition';
const textareaCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 transition resize-none';
const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnDanger = `${btnBase} bg-red-500 hover:bg-red-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

const EMPTY = {
  title: '', slug: '', excerpt: '', content: '',
  coverImage: '', author: 'GoIndiaCab Team', tags: '', status: 'draft',
};

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function Field({ label, required, hint, children, asDiv }) {
  const Tag = asDiv ? 'div' : 'label';
  return (
    <Tag className="block">
      <span className="text-xs font-semibold text-gray-600 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-gray-400 mt-1 block">{hint}</span>}
    </Tag>
  );
}

function ViewModal({ blog, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className={clsx(
              'px-2.5 py-1 text-xs font-semibold rounded-full',
              blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            )}>
              {blog.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <span className="text-xs text-gray-400 font-mono">/blog/{blog.slug}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onEdit(blog); }}
              className={`${btnGhost} h-8 px-3 text-xs`}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="w-full h-56 sm:h-72 overflow-hidden shrink-0">
              <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="px-6 sm:px-8 py-6 space-y-5">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{blog.title}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 border-b border-gray-100 pb-4">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                {blog.author || 'GoIndiaCab Team'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-gray-400" />
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{blog.slug}</span>
              </span>
            </div>

            {/* Tags */}
            {blog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="bg-gray-50 border-l-4 border-amber-400 px-4 py-3 rounded-r-xl">
                <p className="text-sm text-gray-600 italic leading-relaxed">{blog.excerpt}</p>
              </div>
            )}

            {/* Content — rendered HTML */}
            {blog.content ? (
              <div
                className="tiptap prose prose-sm max-w-none text-gray-800 bg-white p-4 rounded-xl"
                dangerouslySetInnerHTML={{
                  __html: blog.content
                    // Decode HTML entities in case content was saved double-encoded
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <FileText className="w-10 h-10 mb-2" />
                <p className="text-sm">No content added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50/40">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export default function Blog() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const canWrite = !!superAdminToken;

  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete'
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Only image files allowed', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => set('coverImage', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const api = useCallback(
    (method, url, data, params) =>
      axios({ method, url: `${BASE}${url}`, data, params, headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', '', undefined, {
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setBlogs(data.data || []);
      setStats(data.stats || { total: 0, published: 0, draft: 0 });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load blogs', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchBlogs, 250);
    return () => clearTimeout(t);
  }, [fetchBlogs]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const openAdd = () => { setForm({ ...EMPTY }); setSelected(null); setModal('add'); };
  const openEdit = (b) => {
    setSelected(b);
    setForm({ ...EMPTY, ...b, tags: (b.tags || []).join(', ') });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      showToast('Title and slug are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: form.coverImage.trim(),
        author: form.author.trim() || 'GoIndiaCab Team',
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: form.status,
      };
      if (modal === 'add') {
        await api('post', '', payload);
        showToast('Blog post created');
      } else {
        await api('put', `/${selected._id}`, payload);
        showToast('Blog post updated');
      }
      setModal(null);
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api('delete', `/${selected._id}`);
      showToast('Blog post deleted');
      setModal(null);
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (b) => {
    const newStatus = b.status === 'published' ? 'draft' : 'published';
    try {
      await api('put', `/${b._id}`, { status: newStatus });
      showToast(`Post ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
      fetchBlogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const statCards = [
    { label: 'Total Posts', value: stats.total ?? 0, icon: BookOpen, tone: 'bg-blue-100 text-blue-600' },
    { label: 'Published', value: stats.published ?? 0, icon: Eye, tone: 'bg-green-100 text-green-600' },
    { label: 'Drafts', value: stats.draft ?? 0, icon: EyeOff, tone: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {toast && (
        <div className={clsx(
          'fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold',
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        )}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 md:px-6 md:py-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Blog Management</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Create and manage blog posts for the <span className="font-semibold text-amber-600">GoIndiaCab website</span>.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <button onClick={fetchBlogs} className={btnGhost}>
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          {canWrite && (
            <button onClick={openAdd} className={btnPrimary}>
              <Plus className="w-4 h-4" /> New Post
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3.5">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.tone)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or tag..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} sm:w-44`}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Blog List */}
      {loading && blogs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-800">No blog posts found</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            {search || statusFilter ? 'Try a different search or filter.' : 'Create your first blog post.'}
          </p>
          {canWrite && !search && !statusFilter && (
            <button onClick={openAdd} className={btnPrimary}><Plus className="w-4 h-4" /> New Post</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blogs.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {b.coverImage && (
                <img src={b.coverImage} alt={b.title} className="w-full h-40 object-cover rounded-t-2xl" />
              )}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{b.title}</h3>
                  <span className={clsx(
                    'px-2.5 py-1 text-xs font-semibold rounded-full shrink-0',
                    b.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {b.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                {b.excerpt && <p className="text-xs text-gray-500 line-clamp-2">{b.excerpt}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  {(b.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>{b.author}</span>
                  <span>{fmtDate(b.publishedAt || b.createdAt)}</span>
                </div>
              </div>
              {canWrite && (
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleStatus(b)}
                    className={clsx(
                      'flex items-center gap-1.5 text-xs font-semibold transition-colors',
                      b.status === 'published' ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'
                    )}
                  >
                    {b.status === 'published' ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(b); setModal('view'); }} title="View" className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(b)} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelected(b); setModal('delete'); }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'New Blog Post' : 'Edit Blog Post'}
          subtitle="Fields marked * are required"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {modal === 'add' ? 'Create Post' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title" required>
                <input
                  value={form.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (modal === 'add') set('slug', slugify(e.target.value));
                  }}
                  placeholder="Best Outstation Cab Routes in India"
                  maxLength={120}
                  className={inputCls}
                />
              </Field>
              <Field label="Slug" required hint="URL-friendly identifier. Auto-generated from title.">
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder="best-outstation-cab-routes"
                  maxLength={150}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Excerpt" hint="Short summary shown in blog listing.">
              <textarea
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="A brief description of the blog post..."
                rows={2}
                maxLength={300}
                className={textareaCls}
              />
            </Field>

            <Field label="Content" hint="Use the toolbar to format headings, bold, lists, links etc. Output is HTML." asDiv>
              <RichTextEditor
                value={form.content}
                onChange={(val) => set('content', val)}
                placeholder="Write your blog post content here..."
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Cover Image" hint="JPG, PNG, WebP — max 5MB.">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                {form.coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32">
                    <img src={form.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set('coverImage', '')}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-amber-500 transition-colors bg-gray-50 hover:bg-amber-50"
                  >
                    <ImagePlus className="w-7 h-7" />
                    <span className="text-xs font-semibold">Click to upload image</span>
                  </button>
                )}
              </Field>
              <Field label="Author">
                <input
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  placeholder="GoIndiaCab Team"
                  maxLength={60}
                  className={inputCls}
                />
              </Field>
              <Field label="Tags" hint="Comma separated: travel, outstation, tips">
                <input
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="travel, outstation, tips"
                  className={inputCls}
                />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>


          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <ViewModal
          blog={selected}
          onClose={() => setModal(null)}
          onEdit={openEdit}
        />
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <Modal
          title="Delete Blog Post"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} className={btnDanger}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </>
          }
        >
          <div className="text-center space-y-3 py-2">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Delete "{selected.title}"?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
