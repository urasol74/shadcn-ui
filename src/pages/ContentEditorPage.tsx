import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Стили для редактора
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';

// Определяем соответствие между slug и заголовком
const pageTitles: { [key: string]: string } = {
  contacts: 'Контакты',
  shipping: 'Доставка',
  returns: 'Возвраты',
};

const ContentEditorPage = () => {
  const { page_slug } = useParams<{ page_slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageTitle = page_slug ? pageTitles[page_slug] || 'Страница' : 'Страница';

  useEffect(() => {
    if (!page_slug) return;

    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', page_slug)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 - это "no rows found", что нормально
        console.error('Error fetching content:', error);
        toast.error('Ошибка при загрузке контента.');
      } else if (data) {
        setContent(data.content || '');
      }
      setLoading(false);
    };

    fetchContent();
  }, [page_slug]);

  const handleSave = async () => {
    if (!page_slug) return;

    setSaving(true);
    const { error } = await supabase
      .from('pages')
      .upsert({ slug: page_slug, content: content }, { onConflict: 'slug' });

    if (error) {
      console.error('Error saving content:', error);
      toast.error('Не удалось сохранить изменения.');
    } else {
      toast.success('Страница успешно сохранена!');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/admin/editor')} 
            className="flex items-center text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к списку страниц
          </button>
          <h1 className="text-3xl font-bold">{`Редактирование: ${pageTitle}`}</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        {loading ? (
          <p>Загрузка редактора...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '400px' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditorPage;
