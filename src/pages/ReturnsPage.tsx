import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { decode } from 'html-entities';

const ReturnsPage = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', 'returns')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching content:', error);
        toast.error('Не удалось загрузить содержимое страницы.');
      } else if (data) {
        const decodedContent = data.content ? decode(data.content) : '';
        setContent(decodedContent);
      }
      setLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <>
      <Toaster />
      <Header />
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Возврат и обмен</h1>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '<p>Содержимое пока не добавлено. Вы можете сделать это в админ-панели.</p>' }}
          />
        )}
      </div>
    </>
  );
};

export default ReturnsPage;
