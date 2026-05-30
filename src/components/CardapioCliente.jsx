import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ChevronRight, X, Clock, HelpCircle, MapPin, CreditCard, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';

export default function CardapioCliente({ onGoToAdmin }) {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState([]);
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [animandoCarrinho, setAnimandoCarrinho] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [chaveCopiada, setChaveCopiada] = useState(false);

  // Formulário de Checkout
  const [checkoutForm, setCheckoutForm] = useState({
    nome: '',
    tipoEntrega: 'entrega', // 'entrega' | 'retirada'
    endereco: '',
    formaPagamento: 'pix', // 'pix' | 'cartao'
    observacao: ''
  });

  // Carregar produtos do Supabase
  useEffect(() => {
    async function fetchProdutos() {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select('*')
          .order('nome', { ascending: true });

        if (error) throw error;
        setProdutos(data || []);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        // Fallback local caso o Supabase não esteja configurado (Sabores Reais da Fran Doces)
        setProdutos([
          {
            id: '1',
            nome: 'Bolo no Pote Ninho com Morango',
            descricao: 'Massa de chocolate, recheio de brigadeiro de chocolate, Ninho com morangos e cobertura de brigadeiro com granulado de chocolate ao leite.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Brigadeiro de Ninho com Morango.jpg'
          },
          {
            id: '2',
            nome: 'Bolo no Pote Brigadeiro com Morangos',
            descricao: 'Massa de chocolate com recheio de brigadeiro de chocolate com morangos e cobertura de brigadeiro com granulado de chocolate ao leite.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Brigadeiro com Morango.jpg'
          },
          {
            id: '3',
            nome: 'Bolo no Pote Prestígio',
            descricao: 'Clássico bolo de chocolate recheado com creme de coco cremoso e cobertura de ganache de chocolate.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Prestigio.jpg'
          },
          {
            id: '4',
            nome: 'Bolo no Pote Brigadeiro com Maracujá',
            descricao: 'Massa de chocolate com recheio de brigadeiro de maracujá e cobertura de brigadeiro de chocolate com granulado de chocolate ao leite.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Brigadeiro de Maracuja.jpg'
          },
          {
            id: '5',
            nome: 'Bolo no Pote Abacaxi com Coco',
            descricao: 'Bolo de baunilha molhado com calda de coco, pedaços de abacaxi cozidos e creme suave.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Abacaxi com Coco.jpg'
          },
          {
            id: '6',
            nome: 'Bolo no Pote Ninho com Nutella',
            descricao: 'Massa de baunilha com recheio de brigadeiro de ninho com nutella e cobertura de chantininho com granulado de chocolate branco.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Ninho com Nutella.jpg'
          },
          {
            id: '7',
            nome: 'Bolo no Pote Merengue de Morango',
            descricao: 'Massa de baunilha com recheio de creme de baunilha com morangos e cobertura de chantininho com suspiros.',
            preco: 15.00,
            disponivel: true,
            imagem_url: '/imagens/Ninho com Morango.jpg'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  // Adicionar ao carrinho com micro-animação
  const adicionarAoCarrinho = (produto) => {
    if (!produto.disponivel) return;

    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.id === produto.id);
      if (itemExistente) {
        return prev.map((item) =>
          item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
        );
      }
      return [...prev, { ...produto, quantidade: 1 }];
    });

    // Disparar animação no botão de carrinho
    setAnimandoCarrinho(true);
    setTimeout(() => setAnimandoCarrinho(false), 500);
  };

  // Alterar quantidade no carrinho
  const alterarQuantidade = (id, delta) => {
    setCarrinho((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const novaQtd = item.quantidade + delta;
            return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remover do carrinho
  const removerDoCarrinho = (id) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  };

  // Total do carrinho
  const totalCarrinho = carrinho.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  // Selecionar número do WhatsApp (revezamento/round-robin)
  const obterNumeroWhatsApp = () => {
    const admin1 = import.meta.env.VITE_WHATSAPP_ADMIN_1 || '5511972028586';
    const admin2 = import.meta.env.VITE_WHATSAPP_ADMIN_2 || '5511975447082';

    // Recupera do localStorage qual foi o último admin que recebeu pedido
    const ultimoAdmin = localStorage.getItem('fran_doces_ultimo_admin');

    if (ultimoAdmin === 'admin1') {
      localStorage.setItem('fran_doces_ultimo_admin', 'admin2');
      return admin2;
    } else {
      localStorage.setItem('fran_doces_ultimo_admin', 'admin1');
      return admin1;
    }
  };

  // Finalizar Pedido
  const handleFinalizarPedido = async (e) => {
    e.preventDefault();

    if (carrinho.length === 0) return;
    if (!checkoutForm.nome.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }
    if (checkoutForm.tipoEntrega === 'entrega' && !checkoutForm.endereco.trim()) {
      alert('Por favor, informe seu endereço de entrega.');
      return;
    }

    try {
      // 1. Registrar a venda no banco de dados do Supabase
      const itensFormatados = carrinho.map(item => ({
        produto_id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      }));

      // A inserção na tabela vendas é pública
      const { error } = await supabase.from('vendas').insert([
        {
          cliente_nome: checkoutForm.nome,
          itens: itensFormatados,
          total: totalCarrinho,
          forma_pagamento: checkoutForm.formaPagamento,
          observacao: checkoutForm.observacao || null
        }
      ]);

      if (error) {
        console.error('Erro ao gravar venda no Supabase:', error);
      }

      // Salva os dados do pedido confirmado para abrir o modal de sucesso/Pix
      setPedidoConfirmado({
        nome: checkoutForm.nome,
        total: totalCarrinho,
        formaPagamento: checkoutForm.formaPagamento,
        tipoEntrega: checkoutForm.tipoEntrega,
        endereco: checkoutForm.endereco
      });

      // Limpar carrinho e fechar modais
      setCarrinho([]);
      setIsCheckoutOpen(false);
      setIsCarrinhoOpen(false);
    } catch (err) {
      console.error('Erro ao processar checkout:', err);
      alert('Desculpe, ocorreu um erro ao salvar seu pedido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 pb-24">
      {/* Header Premium */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-amber-100 bg-amber-700 flex items-center justify-center text-white shadow-md">
              {!logoError ? (
                <img 
                  src="/imagens/logo.jpg" 
                  alt="Logo Fran Doces" 
                  onError={() => setLogoError(true)} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Sparkles className="w-6 h-6 text-amber-100" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-amber-950 font-serif leading-none">Fran Doces</h1>
              <p className="text-xs text-amber-700 font-medium mt-1">Bolos no Pote e Encomendas Gourmet</p>
            </div>
          </div>

          <button
            onClick={() => setIsCarrinhoOpen(true)}
            className={`relative p-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-full shadow-lg transition-transform duration-200 ${
              animandoCarrinho ? 'scale-125' : 'hover:scale-105'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {carrinho.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-xs font-bold w-5.5 h-5.5 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {carrinho.reduce((acc, i) => acc + i.quantidade, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Banner Principal */}
      <section className="bg-gradient-to-br from-amber-950 to-amber-900 text-white py-12 px-4 text-center relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_100%)]"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-5">
          
          {/* Logo Centralizada Gigante em Destaque */}
          <div className="flex justify-center">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/95 bg-amber-900 shadow-2xl transition-transform hover:scale-105 duration-300">
              {!logoError ? (
                <img 
                  src="/imagens/logo.jpg" 
                  alt="Logo Fran Doces" 
                  onError={() => setLogoError(true)} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-amber-800">
                  <Sparkles className="w-12 h-12 text-amber-200" />
                </div>
              )}
            </div>
          </div>

          <span className="inline-block bg-amber-600/30 border border-amber-500/50 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Feito com Amor
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold font-serif tracking-tight leading-tight text-amber-50">
            A doçura perfeita para o seu dia!
          </h2>
          <p className="text-amber-100 max-w-xl mx-auto text-sm md:text-base font-light">
            Experimente nossos maravilhosos bolos no pote com recheios super cremosos e ingredientes selecionados de alta qualidade.
          </p>
          <div className="flex justify-center space-x-6 text-xs text-amber-200">
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-amber-400" /> Entrega Rápida</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-amber-400" /> 100% Artesanal</span>
          </div>
        </div>
      </section>

      {/* Grid de Produtos */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold font-serif text-amber-950 mb-6 border-b border-amber-100 pb-2">
          Cardápio de Bolos no Pote
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-amber-800 text-sm font-medium animate-pulse">Carregando doces delícias...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-100/60 transition-all duration-300 flex flex-col group"
              >
                {/* Imagem do Produto */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img
                    src={produto.imagem_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60'}
                    alt={produto.nome}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {!produto.disponivel && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
                        Esgotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Info do Produto */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-amber-950 font-serif leading-snug group-hover:text-amber-800 transition-colors">
                      {produto.nome}
                    </h4>
                    <p className="text-stone-500 text-sm font-light leading-relaxed line-clamp-2">
                      {produto.descricao}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-black text-amber-900 font-sans">
                      R$ {Number(produto.preco).toFixed(2)}
                    </span>

                    {produto.disponivel ? (
                      <button
                        onClick={() => adicionarAoCarrinho(produto)}
                        className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-stone-100 text-stone-400 text-xs font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed"
                      >
                        Indisponível
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Simples */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-stone-400 text-xs border-t border-amber-100">
        <p>© 2026 Fran Doces. Todos os direitos reservados.</p>
        <p className="mt-1">Feito com muito açúcar e carinho.</p>
        <button
          onClick={onGoToAdmin}
          className="mt-4 text-amber-700/60 hover:text-amber-700 underline font-medium"
        >
          Área do Administrador
        </button>
      </footer>

      {/* DRAWER DO CARRINHO (Lateral Direita) */}
      {isCarrinhoOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCarrinhoOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Header Drawer */}
              <div className="px-6 py-5 bg-amber-950 text-white flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold font-serif">Seu Carrinho</h3>
                </div>
                <button
                  onClick={() => setIsCarrinhoOpen(false)}
                  className="p-1 hover:bg-amber-900 rounded-full transition-colors text-amber-200 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo Drawer */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {carrinho.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-800">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-stone-700 font-medium">Seu carrinho está vazio</p>
                      <p className="text-stone-400 text-xs mt-1">Que tal adicionar um delicioso bolo no pote?</p>
                    </div>
                    <button
                      onClick={() => setIsCarrinhoOpen(false)}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-colors"
                    >
                      Ver Cardápio
                    </button>
                  </div>
                ) : (
                  carrinho.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 bg-stone-50 rounded-2xl border border-amber-100/50"
                    >
                      <img
                        src={item.imagem_url}
                        alt={item.nome}
                        className="w-16 h-16 object-cover rounded-xl bg-white shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-amber-950 truncate font-serif">{item.nome}</h4>
                        <p className="text-xs text-amber-900 font-semibold mt-0.5">
                          R$ {item.preco.toFixed(2)}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => alterarQuantidade(item.id, -1)}
                            className="p-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3 text-stone-600" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantidade}</span>
                          <button
                            onClick={() => alterarQuantidade(item.id, 1)}
                            className="p-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3 text-stone-600" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removerDoCarrinho(item.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Drawer */}
              {carrinho.length > 0 && (
                <div className="border-t border-amber-100 p-6 bg-stone-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium text-sm">Subtotal</span>
                    <span className="text-2xl font-black text-amber-950">
                      R$ {totalCarrinho.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCarrinhoOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] duration-150 flex items-center justify-center space-x-2"
                  >
                    <span>Finalizar Pedido</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CHECKOUT */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCheckoutOpen(false)}
          ></div>

          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Header Checkout */}
            <div className="px-6 py-5 bg-amber-950 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-amber-400" />
                Dados do Pedido
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 hover:bg-amber-900 rounded-full transition-colors text-amber-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Checkout */}
            <form onSubmit={handleFinalizarPedido} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  required
                  placeholder="Como quer ser chamado?"
                  value={checkoutForm.nome}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, nome: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 bg-stone-50 text-stone-800"
                />
              </div>

              {/* Tipo de Entrega */}
              <div>
                <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Método de Entrega
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, tipoEntrega: 'entrega' })}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      checkoutForm.tipoEntrega === 'entrega'
                        ? 'border-amber-700 bg-amber-50/50 text-amber-950 font-bold'
                        : 'border-stone-200 text-stone-500 bg-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, tipoEntrega: 'retirada' })}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      checkoutForm.tipoEntrega === 'retirada'
                        ? 'border-amber-700 bg-amber-50/50 text-amber-950 font-bold'
                        : 'border-stone-200 text-stone-500 bg-white'
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Retirada
                  </button>
                </div>
              </div>

              {/* Endereço (se entrega) */}
              {checkoutForm.tipoEntrega === 'entrega' && (
                <div className="transition-all animate-fadeIn">
                  <label htmlFor="endereco" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Endereço de Entrega *
                  </label>
                  <textarea
                    id="endereco"
                    required
                    rows="3"
                    placeholder="Rua, número, bairro e ponto de referência"
                    value={checkoutForm.endereco}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, endereco: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 bg-stone-50 text-stone-800"
                  ></textarea>
                </div>
              )}

              {/* Forma de Pagamento */}
              <div>
                <span className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Forma de Pagamento
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, formaPagamento: 'pix' })}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      checkoutForm.formaPagamento === 'pix'
                        ? 'border-amber-700 bg-amber-50/50 text-amber-950 font-bold'
                        : 'border-stone-200 text-stone-500 bg-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-amber-600" />
                    Pix
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutForm({ ...checkoutForm, formaPagamento: 'cartao' })}
                    className={`flex items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      checkoutForm.formaPagamento === 'cartao'
                        ? 'border-amber-700 bg-amber-50/50 text-amber-950 font-bold'
                        : 'border-stone-200 text-stone-500 bg-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2 text-amber-600" />
                    Cartão
                  </button>
                </div>
              </div>

              {/* Observação Geral */}
              <div>
                <label htmlFor="observacao" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Observações (Opcional)
                </label>
                <input
                  type="text"
                  id="observacao"
                  placeholder="Ex: sem coco, colher descartável, troco..."
                  value={checkoutForm.observacao}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, observacao: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 bg-stone-50 text-stone-800"
                />
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2 mt-4">
                <div className="flex justify-between text-xs text-stone-500 font-medium">
                  <span>Itens selecionados</span>
                  <span>{carrinho.reduce((acc, i) => acc + i.quantidade, 0)} bolos</span>
                </div>
                <div className="flex justify-between font-black text-amber-950 border-t border-amber-100/50 pt-2 text-lg">
                  <span>Total Geral</span>
                  <span>R$ {totalCarrinho.toFixed(2)}</span>
                </div>
              </div>

              {/* Botão de Submissão */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01] duration-150 flex items-center justify-center space-x-2 mt-6"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirmar Pedido</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO DO PEDIDO (PIX OU CARTÃO) */}
      {pedidoConfirmado && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs" 
            onClick={() => {
              if (pedidoConfirmado.formaPagamento !== 'pix') {
                setPedidoConfirmado(null);
              }
            }}
          ></div>

          <div className="relative bg-[#f8f8f8] rounded-[32px] max-w-sm w-full shadow-2xl overflow-hidden z-10 p-6 flex flex-col items-center text-center border border-amber-100/50">
            {pedidoConfirmado.formaPagamento === 'pix' ? (
              <div className="w-full space-y-5">
                
                {/* Botão de Fechar Modal no topo direito */}
                <button
                  onClick={() => setPedidoConfirmado(null)}
                  className="absolute top-4 right-4 p-1 bg-stone-200/50 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Cabeçalho */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-amber-950">Apresentar Casal</h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Você escolheu: <span className="font-semibold text-stone-700">Cotas de lua de mel!</span>
                  </p>
                  <p className="text-2xl font-black text-amber-950 mt-1.5">
                    R$ {Number(pedidoConfirmado.total).toFixed(2)}
                  </p>
                </div>

                {/* Box do QR Code */}
                <div className="bg-white rounded-2xl p-5 border border-stone-200/60 flex flex-col items-center shadow-xs">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3">
                    Escaneie o QR Code ou use a chave abaixo:
                  </p>
                  
                  {/* QR Code Container com logo do Itaú no meio */}
                  <div className="relative w-40 h-40 bg-white p-1 rounded-xl border border-stone-100 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                        `00020101021226840014br.gov.bcb.pix2562pix.itau.com.br/qr/v2/44122d26-7c98-4682-841c-3094ca5ec72e5204000053039865802BR5916Francine Giavoni6009Sao Paulo62070503***6304D1B5`
                      )}`}
                      alt="QR Code Pix"
                      className="w-full h-full object-contain"
                    />
                    {/* Logo Itaú centralizado no QR Code */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#004691] text-white font-extrabold text-[8px] px-1 py-0.5 rounded border border-white shadow-md flex items-center justify-center font-sans tracking-tighter">
                      itaú
                    </div>
                  </div>

                  {/* Nome da Francine */}
                  <h4 className="text-xs font-black text-[#ff6200] uppercase tracking-wide mt-4">
                    FRANCINE GIAVONI
                  </h4>
                  <p className="text-[10px] text-stone-400 font-bold mt-0.5">
                    +55 (11) 97544-7082
                  </p>
                </div>

                {/* Botão de Chave Copia e Cola */}
                <div className="space-y-2.5">
                  <div className="w-full bg-white border border-stone-200/80 rounded-xl py-3.5 text-sm font-bold text-stone-700 shadow-xs">
                    11975447082
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('11975447082');
                      setChaveCopiada(true);
                      setTimeout(() => setChaveCopiada(false), 2000);
                    }}
                    className={`w-full font-bold py-3.5 rounded-xl border transition-colors text-xs ${
                      chaveCopiada 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-[#eeeeee] hover:bg-stone-200 text-stone-700 border-stone-200/60 shadow-xs'
                    }`}
                  >
                    {chaveCopiada ? 'Chave Copiada!' : 'Copiar Chave'}
                  </button>
                </div>

                {/* Botão de Fechamento */}
                <button
                  type="button"
                  onClick={() => setPedidoConfirmado(null)}
                  className="w-full bg-[#1b1b1b] hover:bg-black text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  JÁ REALIZEI O PIX
                </button>
              </div>
            ) : (
              <div className="w-full space-y-6 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold font-serif text-amber-950">Pedido Confirmado!</h3>
                  <p className="text-xs text-stone-500 px-2 leading-relaxed">
                    Olá <span className="font-semibold text-stone-700">{pedidoConfirmado.nome}</span>, recebemos seu pedido de bolo no pote com sucesso! 
                  </p>
                  <p className="text-xs text-stone-500 px-2 leading-relaxed">
                    A maquininha de cartão será enviada junto com o seu pedido.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-stone-200/60 text-left text-xs space-y-1.5 text-stone-600 shadow-xs">
                  <p><strong>Total:</strong> R$ {Number(pedidoConfirmado.total).toFixed(2)}</p>
                  <p><strong>Entrega:</strong> {pedidoConfirmado.tipoEntrega === 'entrega' ? `🚗 ${pedidoConfirmado.endereco}` : '🏪 Retirada no Local'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setPedidoConfirmado(null)}
                  className="w-full bg-[#1b1b1b] hover:bg-black text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
