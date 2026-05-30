import React, { useState, useEffect } from 'react';
import CardapioCliente from './components/CardapioCliente';
import LoginAdmin from './components/LoginAdmin';
import PainelAdmin from './components/PainelAdmin';
import { supabase } from './supabase';

function App() {
  const [tela, setTela] = useState('cliente'); // 'cliente' | 'login' | 'admin'
  const [usuario, setUsuario] = useState(null);

  // Escuta o status de autenticação ativa do Supabase e parâmetros secretos de URL
  useEffect(() => {
    // Parâmetro secreto na URL para acessar o painel administrativo de forma oculta
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('gerente') === 'true' || params.get('login') === 'true') {
      setTela('login');
      // Limpa a URL na barra de endereços silenciosamente para que ninguém veja o parâmetro
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Pegar sessão atual na inicialização
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user);
        setTela('admin');
      }
    });

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user);
        setTela('admin');
      } else {
        setUsuario(null);
        // Só redireciona para a home se o usuário deslogar do painel
        if (tela === 'admin') {
          setTela('cliente');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [tela]);

  const handleLoginSuccess = (user) => {
    setUsuario(user);
    setTela('admin');
  };

  const handleLogout = async () => {
    // Se for usuário demo (mock), desloga localmente
    if (usuario?.is_demo) {
      setUsuario(null);
      setTela('cliente');
    } else {
      await supabase.auth.signOut();
      setUsuario(null);
      setTela('cliente');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 select-none">
      {tela === 'cliente' && (
        <CardapioCliente onGoToAdmin={() => setTela(usuario ? 'admin' : 'login')} />
      )}

      {tela === 'login' && (
        <LoginAdmin 
          onLoginSuccess={handleLoginSuccess} 
          onBackToMenu={() => setTela('cliente')} 
        />
      )}

      {tela === 'admin' && (
        <PainelAdmin 
          user={usuario} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}

export default App;
