import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';

export default function LoginAdmin({ onLoginSuccess, onBackToMenu }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha
      });

      if (error) {
        // Se der erro de autenticação ou se o Supabase não estiver configurado
        if (error.message.includes('Fetch') || error.message.includes('API') || error.message.includes('Invalid URL') || error.message.includes('Database')) {
          // Detecta se é erro de infraestrutura/configuração e sugere modo de demonstração
          setErro('Não foi possível conectar ao Supabase. Deseja testar o painel no Modo de Demonstração local?');
          setDemoMode(true);
        } else {
          setErro('E-mail ou senha incorretos. Tente novamente.');
        }
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setErro('Erro de conexão. Ativando Modo de Demonstração para testes.');
      setDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarDemo = () => {
    // Entrar com usuário de testes local
    const mockUser = {
      id: 'demo-user-id',
      email: email || 'admin@frandoces.com',
      is_demo: true
    };
    onLoginSuccess(mockUser);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center text-xs font-semibold text-amber-950 hover:text-amber-800 transition-colors mb-6 group bg-white px-3 py-1.5 rounded-full shadow-xs border border-amber-100 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-0.5" />
          Voltar para o Cardápio
        </button>

        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-full bg-amber-700 items-center justify-center text-white shadow-md mb-3">
            <Lock className="w-6 h-6 text-amber-100" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-serif text-amber-950">
            Painel do Administrador
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Acesse as configurações do cardápio, fiados e estatísticas.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-amber-100/50 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {erro && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950">
                <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold mb-1">{erro}</p>
                  {demoMode && (
                    <button
                      type="button"
                      onClick={handleEntrarDemo}
                      className="mt-2 bg-amber-800 hover:bg-amber-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                    >
                      Acessar no Modo Demo
                    </button>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700"
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Senha secreta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-stone-400" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Sua senha de acesso"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 block w-full px-4 py-3 border border-stone-200 rounded-xl bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] duration-150 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Entrar no Painel</span>
                )}
              </button>
            </div>
          </form>

          {/* Dica para Modo Demo Rápido */}
          <div className="mt-6 border-t border-stone-100 pt-6 text-center">
            <button
              onClick={handleEntrarDemo}
              className="text-xs font-medium text-stone-400 hover:text-amber-800 transition-colors flex items-center justify-center mx-auto"
            >
              <ShieldAlert className="w-4 h-4 mr-1 text-stone-400" />
              Entrar direto no Painel (Visualização Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
