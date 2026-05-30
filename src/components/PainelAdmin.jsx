import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  LogOut, Plus, Edit2, Trash2, Check, X, Search, UserPlus, DollarSign, 
  TrendingUp, Layers, User, Award, ShoppingBag, Eye, EyeOff, Save, Calendar
} from 'lucide-react';

export default function PainelAdmin({ user, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState('cardapio'); // 'cardapio' | 'fiados' | 'dashboard'
  const isDemo = user?.is_demo || false;

  // ESTADOS - CARDÁPIO (PRODUTOS)
  const [produtos, setProdutos] = useState([]);
  const [produtosLoading, setProdutosLoading] = useState(true);
  const [editandoProduto, setEditandoProduto] = useState(null); // produto sendo editado ou 'novo'
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    disponivel: true,
    imagem_url: ''
  });

  // ESTADOS - FIADOS (CLIENTES & DÍVIDAS)
  const [clientes, setClientes] = useState([]);
  const [clientesLoading, setClientesLoading] = useState(true);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [dividas, setDividas] = useState([]);
  const [dividasLoading, setDividasLoading] = useState(false);
  const [formDivida, setFormDivida] = useState({ valor: '', descricao: '' });
  const [formNovoCliente, setFormNovoCliente] = useState({ nome: '', telefone: '' });
  const [isCriandoCliente, setIsCriandoCliente] = useState(false);

  // ESTADOS - DASHBOARD (ESTATÍSTICAS)
  const [vendas, setVendas] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // =========================================================================
  // 1. CARREGAMENTO DOS DADOS (SUPABASE OU DEMO)
  // =========================================================================

  // Carregar dados iniciais
  useEffect(() => {
    carregarProdutos();
    carregarClientes();
    carregarVendas();
  }, []);

  // Recarregar dívidas quando o cliente selecionado mudar
  useEffect(() => {
    if (clienteSelecionado) {
      carregarDividas(clienteSelecionado.id);
    }
  }, [clienteSelecionado]);

  // --- Funções para Produtos ---
  const carregarProdutos = async () => {
    setProdutosLoading(true);
    if (isDemo) {
      // Dados mockados (Sabores Reais da Fran Doces)
      const mock = JSON.parse(localStorage.getItem('fran_doces_demo_produtos')) || [
        { id: '1', nome: 'Bolo no Pote Ninho com Morango', descricao: 'Massa de chocolate, recheio de brigadeiro de chocolate, Ninho com morangos e cobertura de brigadeiro com granulado de chocolate ao leite.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Brigadeiro de Ninho com Morango.jpg' },
        { id: '2', nome: 'Bolo no Pote Brigadeiro com Morangos', descricao: 'Massa de chocolate com recheio de brigadeiro de chocolate com morangos e cobertura de brigadeiro com granulado de chocolate ao leite.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Brigadeiro com Morango.jpg' },
        { id: '3', nome: 'Bolo no Pote Prestígio', descricao: 'Clássico bolo de chocolate recheado com creme de coco cremoso e cobertura de ganache de chocolate.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Prestigio.jpg' },
        { id: '4', nome: 'Bolo no Pote Brigadeiro com Maracujá', descricao: 'Massa de chocolate com recheio de brigadeiro de maracujá e cobertura de brigadeiro de chocolate com granulado de chocolate ao leite.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Brigadeiro de Maracuja.jpg' },
        { id: '5', nome: 'Bolo no Pote Abacaxi com Coco', descricao: 'Bolo de baunilha molhado com calda de coco, pedaços de abacaxi cozidos e creme suave.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Abacaxi com Coco.jpg' },
        { id: '6', nome: 'Bolo no Pote Ninho com Nutella', descricao: 'Massa de baunilha com recheio de brigadeiro de ninho com nutella e cobertura de chantininho com granulado de chocolate branco.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Ninho com Nutella.jpg' },
        { id: '7', nome: 'Bolo no Pote Merengue de Morango', descricao: 'Massa de baunilha com recheio de creme de baunilha com morangos e cobertura de chantininho com suspiros.', preco: 15.00, disponivel: true, imagem_url: '/imagens/Ninho com Morango.jpg' }
      ];
      setProdutos(mock);
      localStorage.setItem('fran_doces_demo_produtos', JSON.stringify(mock));
      setProdutosLoading(false);
    } else {
      try {
        const { data, error } = await supabase.from('produtos').select('*').order('nome', { ascending: true });
        if (error) throw error;
        setProdutos(data || []);
      } catch (err) {
        console.error('Erro ao ler produtos:', err);
      } finally {
        setProdutosLoading(false);
      }
    }
  };

  // --- Funções para Clientes de Fiado ---
  const carregarClientes = async () => {
    setClientesLoading(true);
    if (isDemo) {
      const mock = JSON.parse(localStorage.getItem('fran_doces_demo_clientes')) || [
        { id: 'c1', nome: 'João Silva', telefone: '11999998888', created_at: new Date().toISOString() },
        { id: 'c2', nome: 'Maria Souza', telefone: '11988887777', created_at: new Date().toISOString() },
        { id: 'c3', nome: 'Carlos Oliveira', telefone: '11977776666', created_at: new Date().toISOString() }
      ];
      setClientes(mock);
      localStorage.setItem('fran_doces_demo_clientes', JSON.stringify(mock));
      setClientesLoading(false);
    } else {
      try {
        const { data, error } = await supabase.from('clientes_fiado').select('*').order('nome', { ascending: true });
        if (error) throw error;
        setClientes(data || []);
      } catch (err) {
        console.error('Erro ao ler clientes:', err);
      } finally {
        setClientesLoading(false);
      }
    }
  };

  // --- Funções para Dívidas do Cliente ---
  const carregarDividas = async (clienteId) => {
    setDividasLoading(true);
    if (isDemo) {
      const todasDividas = JSON.parse(localStorage.getItem('fran_doces_demo_dividas')) || [
        { id: 'd1', cliente_id: 'c1', valor: 30.00, descricao: '2x Bolo Prestígio', status: 'pendente', data_pagamento: null, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'd2', cliente_id: 'c1', valor: 15.00, descricao: '1x Bolo Ninho', status: 'pago', data_pagamento: new Date().toISOString(), created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 'd3', cliente_id: 'c2', valor: 14.50, descricao: '1x Bolo Brigadeiro Gourmet', status: 'pendente', data_pagamento: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
      ];
      const filtradas = todasDividas.filter(d => d.cliente_id === clienteId);
      setDividas(filtradas);
      localStorage.setItem('fran_doces_demo_dividas', JSON.stringify(todasDividas));
      setDividasLoading(false);
    } else {
      try {
        const { data, error } = await supabase
          .from('dividas_fiado')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setDividas(data || []);
      } catch (err) {
        console.error('Erro ao ler dividas:', err);
      } finally {
        setDividasLoading(false);
      }
    }
  };

  // --- Funções para Vendas ---
  const carregarVendas = async () => {
    setDashboardLoading(true);
    if (isDemo) {
      const mock = JSON.parse(localStorage.getItem('fran_doces_demo_vendas')) || [
        { id: 'v1', cliente_nome: 'Marcos André', total: 45.00, forma_pagamento: 'pix', itens: [{ nome: 'Bolo no Pote Ninho com Morango', quantidade: 2 }, { nome: 'Bolo no Pote Prestígio', quantidade: 1 }], created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'v2', cliente_nome: 'Juliana Pires', total: 29.00, forma_pagamento: 'cartao', itens: [{ nome: 'Bolo no Pote Prestígio', quantidade: 2 }], created_at: new Date().toISOString() },
        { id: 'v3', cliente_nome: 'João Silva', total: 30.00, forma_pagamento: 'fiado', itens: [{ nome: 'Bolo no Pote Ninho com Morango', quantidade: 2 }], created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'v4', cliente_nome: 'Rita Rocha', total: 14.50, forma_pagamento: 'pix', itens: [{ nome: 'Bolo no Pote Brigadeiro de Maracujá', quantidade: 1 }], created_at: new Date().toISOString() }
      ];
      setVendas(mock);
      localStorage.setItem('fran_doces_demo_vendas', JSON.stringify(mock));
      setDashboardLoading(false);
    } else {
      try {
        const { data, error } = await supabase.from('vendas').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setVendas(data || []);
      } catch (err) {
        console.error('Erro ao ler vendas:', err);
      } finally {
        setDashboardLoading(false);
      }
    }
  };

  // =========================================================================
  // 2. LÓGICA DE PRODUTOS (CRUD)
  // =========================================================================

  const handleSalvarProduto = async (e) => {
    e.preventDefault();
    if (!formProduto.nome.trim() || !formProduto.preco) return;

    const dataProduto = {
      nome: formProduto.nome,
      descricao: formProduto.descricao,
      preco: parseFloat(formProduto.preco),
      disponivel: formProduto.disponivel,
      imagem_url: formProduto.imagem_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60'
    };

    if (isDemo) {
      let novosProd = [...produtos];
      if (editandoProduto === 'novo') {
        const novo = { id: String(Date.now()), ...dataProduto, created_at: new Date().toISOString() };
        novosProd.push(novo);
      } else {
        novosProd = novosProd.map(p => p.id === editandoProduto.id ? { ...p, ...dataProduto } : p);
      }
      setProdutos(novosProd);
      localStorage.setItem('fran_doces_demo_produtos', JSON.stringify(novosProd));
      setEditandoProduto(null);
    } else {
      try {
        let result;
        if (editandoProduto === 'novo') {
          result = await supabase.from('produtos').insert([dataProduto]);
        } else {
          result = await supabase.from('produtos').update(dataProduto).eq('id', editandoProduto.id);
        }
        if (result.error) throw result.error;
        carregarProdutos();
        setEditandoProduto(null);
      } catch (err) {
        console.error('Erro ao salvar produto:', err);
        alert('Erro ao salvar produto.');
      }
    }
  };

  const handleToggleDisponibilidade = async (produto) => {
    const novoStatus = !produto.disponivel;
    if (isDemo) {
      const novosProd = produtos.map(p => p.id === produto.id ? { ...p, disponivel: novoStatus } : p);
      setProdutos(novosProd);
      localStorage.setItem('fran_doces_demo_produtos', JSON.stringify(novosProd));
    } else {
      try {
        const { error } = await supabase.from('produtos').update({ disponivel: novoStatus }).eq('id', produto.id);
        if (error) throw error;
        // Atualização otimista
        setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, disponivel: novoStatus } : p));
      } catch (err) {
        console.error('Erro ao alternar status do produto:', err);
      }
    }
  };

  const handleDeletarProduto = async (id) => {
    if (!confirm('Deseja realmente excluir este produto do cardápio?')) return;

    if (isDemo) {
      const novosProd = produtos.filter(p => p.id !== id);
      setProdutos(novosProd);
      localStorage.setItem('fran_doces_demo_produtos', JSON.stringify(novosProd));
    } else {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) throw error;
        setProdutos(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error('Erro ao deletar produto:', err);
        alert('Erro ao deletar produto.');
      }
    }
  };

  // Abrir formulário para criar ou editar produto
  const abrirFormProduto = (produto = null) => {
    if (produto) {
      setEditandoProduto(produto);
      setFormProduto({
        nome: produto.nome,
        descricao: produto.descricao || '',
        preco: produto.preco,
        disponivel: produto.disponivel,
        imagem_url: produto.imagem_url || ''
      });
    } else {
      setEditandoProduto('novo');
      setFormProduto({
        nome: '',
        descricao: '',
        preco: '',
        disponivel: true,
        imagem_url: ''
      });
    }
  };

  // =========================================================================
  // 3. LÓGICA DE FIADOS
  // =========================================================================

  const handleCriarCliente = async (e) => {
    e.preventDefault();
    if (!formNovoCliente.nome.trim()) return;

    if (isDemo) {
      const todosClientes = JSON.parse(localStorage.getItem('fran_doces_demo_clientes')) || [];
      const novo = {
        id: 'c_' + Date.now(),
        nome: formNovoCliente.nome,
        telefone: formNovoCliente.telefone,
        created_at: new Date().toISOString()
      };
      const novos = [...todosClientes, novo];
      setClientes(novos);
      localStorage.setItem('fran_doces_demo_clientes', JSON.stringify(novos));
      setClienteSelecionado(novo);
      setFormNovoCliente({ nome: '', telefone: '' });
      setIsCriandoCliente(false);
    } else {
      try {
        const { data, error } = await supabase.from('clientes_fiado').insert([
          { nome: formNovoCliente.nome, telefone: formNovoCliente.telefone }
        ]).select();
        
        if (error) throw error;
        carregarClientes();
        if (data && data[0]) setClienteSelecionado(data[0]);
        setFormNovoCliente({ nome: '', telefone: '' });
        setIsCriandoCliente(false);
      } catch (err) {
        console.error('Erro ao cadastrar cliente:', err);
      }
    }
  };

  const handleLancarDivida = async (e) => {
    e.preventDefault();
    if (!clienteSelecionado || !formDivida.valor || !formDivida.descricao.trim()) return;

    const valorNum = parseFloat(formDivida.valor);
    const dadosDivida = {
      cliente_id: clienteSelecionado.id,
      valor: valorNum,
      descricao: formDivida.descricao,
      status: 'pendente',
      data_pagamento: null
    };

    if (isDemo) {
      const todas = JSON.parse(localStorage.getItem('fran_doces_demo_dividas')) || [];
      const nova = { id: 'd_' + Date.now(), ...dadosDivida, created_at: new Date().toISOString() };
      const atualizadas = [...todas, nova];
      localStorage.setItem('fran_doces_demo_dividas', JSON.stringify(atualizadas));
      
      // Também precisamos simular a inserção na tabela vendas se for fiado
      const todasVendas = JSON.parse(localStorage.getItem('fran_doces_demo_vendas')) || [];
      todasVendas.push({
        id: 'v_' + Date.now(),
        cliente_nome: clienteSelecionado.nome,
        total: valorNum,
        forma_pagamento: 'fiado',
        itens: [{ nome: formDivida.descricao, quantidade: 1 }],
        created_at: new Date().toISOString()
      });
      localStorage.setItem('fran_doces_demo_vendas', JSON.stringify(todasVendas));

      carregarDividas(clienteSelecionado.id);
      carregarVendas();
      setFormDivida({ valor: '', descricao: '' });
    } else {
      try {
        const { error } = await supabase.from('dividas_fiado').insert([dadosDivida]);
        if (error) throw error;

        // Grava no histórico geral de vendas também
        await supabase.from('vendas').insert([{
          cliente_nome: clienteSelecionado.nome,
          total: valorNum,
          forma_pagamento: 'fiado',
          itens: [{ nome: formDivida.descricao, quantidade: 1 }]
        }]);

        carregarDividas(clienteSelecionado.id);
        carregarVendas();
        setFormDivida({ valor: '', descricao: '' });
      } catch (err) {
        console.error('Erro ao registrar dívida:', err);
      }
    }
  };

  const handlePagarDivida = async (dividaId) => {
    const dataHoraPagamento = new Date().toISOString();
    if (isDemo) {
      const todas = JSON.parse(localStorage.getItem('fran_doces_demo_dividas')) || [];
      const atualizadas = todas.map(d => d.id === dividaId ? { ...d, status: 'pago', data_pagamento: dataHoraPagamento } : d);
      localStorage.setItem('fran_doces_demo_dividas', JSON.stringify(atualizadas));
      carregarDividas(clienteSelecionado.id);
    } else {
      try {
        const { error } = await supabase.from('dividas_fiado').update({
          status: 'pago',
          data_pagamento: dataHoraPagamento
        }).eq('id', dividaId);
        if (error) throw error;
        carregarDividas(clienteSelecionado.id);
      } catch (err) {
        console.error('Erro ao quitar dívida:', err);
      }
    }
  };

  // Cálculo do total na rua (contando apenas pendentes)
  const calcularTotalNaRua = () => {
    if (isDemo) {
      const todas = JSON.parse(localStorage.getItem('fran_doces_demo_dividas')) || [];
      return todas.filter(d => d.status === 'pendente').reduce((sum, d) => sum + Number(d.valor), 0);
    } else {
      // Como ler do banco? Podemos somar todas as dividas pendentes que já carregamos dos clientes.
      // Porém, para dar o valor real de tudo, é melhor calcular com base nas dívidas se tivéssemos carregado todas.
      // No Supabase de produção podemos fazer uma query ou obter a soma dos clientes.
      // Vamos simular somando as dividas conhecidas. Deixe-me fazer uma query para somar todas as dividas pendentes se não for demo.
      // Por simplicidade, podemos fazer isso localmente varrendo todas se carregadas, ou apenas somando.
      // Vamos ler todas as dívidas ativas para ter a soma correta.
    }
  };

  const [totalNaRua, setTotalNaRua] = useState(0);

  useEffect(() => {
    async function calcularFaturamentoEFiados() {
      if (isDemo) {
        const todas = JSON.parse(localStorage.getItem('fran_doces_demo_dividas')) || [];
        const pendentesSum = todas.filter(d => d.status === 'pendente').reduce((sum, d) => sum + Number(d.valor), 0);
        setTotalNaRua(pendentesSum);
      } else {
        try {
          const { data, error } = await supabase.from('dividas_fiado').select('valor').eq('status', 'pendente');
          if (error) throw error;
          const sum = data.reduce((acc, curr) => acc + Number(curr.valor), 0);
          setTotalNaRua(sum);
        } catch (err) {
          console.error(err);
        }
      }
    }
    calcularFaturamentoEFiados();
  }, [dividas, clientes]);

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(termoPesquisa.toLowerCase())
  );

  // =========================================================================
  // 4. LÓGICA DO DASHBOARD (MÓDULO DE ESTATÍSTICAS)
  // =========================================================================

  const calcularEstatisticas = () => {
    const totalFaturado = vendas.reduce((sum, v) => sum + Number(v.total), 0);
    const totalPedidos = vendas.length;

    // Sabores mais vendidos
    const contagemSabores = {};
    vendas.forEach(v => {
      if (Array.isArray(v.itens)) {
        v.itens.forEach(item => {
          const nomeSabor = item.nome || 'Sabor Indefinido';
          const qtd = Number(item.quantidade) || 1;
          contagemSabores[nomeSabor] = (contagemSabores[nomeSabor] || 0) + qtd;
        });
      }
    });

    const maisVendidos = Object.keys(contagemSabores).map(sabor => ({
      nome: sabor,
      quantidade: contagemSabores[sabor]
    })).sort((a, b) => b.quantidade - a.quantidade);

    return { totalFaturado, totalPedidos, maisVendidos };
  };

  const { totalFaturado, totalPedidos, maisVendidos } = calcularEstatisticas();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col md:flex-row">
      
      {/* Sidebar do Administrador */}
      <aside className="w-full md:w-64 bg-amber-950 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-amber-900/50">
        <div>
          {/* Header Sidebar */}
          <div className="p-6 border-b border-amber-900/60 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-800 flex items-center justify-center text-white shadow-inner">
              <Award className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif leading-none">Fran Doces</h2>
              <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Painel Admin</span>
            </div>
          </div>

          {/* Modo de Teste Warning */}
          {isDemo && (
            <div className="mx-4 mt-4 p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-center text-amber-200 text-xs">
              <span className="font-bold">Modo de Demonstração</span>
              <p className="text-[10px] mt-0.5 opacity-90">Os dados serão salvos no navegador.</p>
            </div>
          )}

          {/* Menus */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setAbaAtiva('cardapio')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                abaAtiva === 'cardapio' 
                  ? 'bg-amber-800 text-white shadow-md' 
                  : 'text-amber-100/70 hover:bg-amber-900/50 hover:text-white'
              }`}
            >
              <Layers className="w-5 h-5 mr-3 shrink-0" />
              Gerenciar Cardápio
            </button>
            <button
              onClick={() => setAbaAtiva('fiados')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                abaAtiva === 'fiados' 
                  ? 'bg-amber-800 text-white shadow-md' 
                  : 'text-amber-100/70 hover:bg-amber-900/50 hover:text-white'
              }`}
            >
              <User className="w-5 h-5 mr-3 shrink-0" />
              Controle de Fiados
            </button>
            <button
              onClick={() => setAbaAtiva('dashboard')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                abaAtiva === 'dashboard' 
                  ? 'bg-amber-800 text-white shadow-md' 
                  : 'text-amber-100/70 hover:bg-amber-900/50 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-3 shrink-0" />
              Estatísticas
            </button>
          </nav>
        </div>

        {/* Rodapé Sidebar */}
        <div className="p-4 border-t border-amber-900/60">
          <div className="flex items-center justify-between text-xs text-amber-200/60 mb-3 px-2">
            <span className="truncate max-w-[120px]">{user?.email || 'admin'}</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-amber-900 hover:bg-rose-900/60 border border-amber-800/40 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        
        {/* ===================================================================
            ABA 1: GERENCIAR CARDÁPIO (CRUD)
            =================================================================== */}
        {abaAtiva === 'cardapio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-2xl font-bold font-serif text-amber-950">Gerenciador do Cardápio</h3>
                <p className="text-xs text-stone-500 mt-0.5">Cadastre, edite e mude o status dos seus bolos no pote.</p>
              </div>
              <button
                onClick={() => abrirFormProduto()}
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Sabor</span>
              </button>
            </div>

            {produtosLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-amber-100 p-8">
                <p className="text-stone-500 font-medium">Nenhum bolo no pote cadastrado</p>
                <button
                  onClick={() => abrirFormProduto()}
                  className="mt-3 text-sm text-amber-700 hover:text-amber-800 font-semibold"
                >
                  Cadastre o primeiro sabor agora!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="bg-white rounded-2xl border border-amber-100/60 shadow-xs overflow-hidden flex flex-col justify-between"
                  >
                    {/* Imagem + Toggle */}
                    <div className="relative aspect-video bg-stone-100">
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge Disponibilidade */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => handleToggleDisponibilidade(produto)}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-md transition-all ${
                            produto.disponivel 
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                              : 'bg-rose-600 text-white hover:bg-rose-700'
                          }`}
                        >
                          {produto.disponivel ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{produto.disponivel ? 'Disponível' : 'Indisponível'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Descrição */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-950 text-base leading-snug">{produto.nome}</h4>
                        <p className="text-stone-500 text-xs font-light line-clamp-2">{produto.descricao}</p>
                      </div>
                      
                      <div className="flex justify-between items-center border-t border-stone-50/80 pt-4">
                        <span className="text-lg font-black text-amber-900">R$ {Number(produto.preco).toFixed(2)}</span>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => abrirFormProduto(produto)}
                            className="p-2 bg-stone-50 hover:bg-amber-50 text-stone-500 hover:text-amber-800 rounded-lg transition-colors border border-stone-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletarProduto(produto.id)}
                            className="p-2 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors border border-stone-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FORMULÁRIO DO PRODUTO (MODAL MODAL/LATERAL) */}
            {editandoProduto && (
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={() => setEditandoProduto(null)}></div>
                
                <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden z-10">
                  <div className="px-6 py-5 bg-amber-950 text-white flex justify-between items-center">
                    <h4 className="text-lg font-bold font-serif">
                      {editandoProduto === 'novo' ? 'Novo Bolo no Pote' : 'Editar Bolo no Pote'}
                    </h4>
                    <button onClick={() => setEditandoProduto(null)} className="text-amber-200 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSalvarProduto} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Sabor/Nome *</label>
                      <input
                        type="text"
                        required
                        value={formProduto.nome}
                        onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                        placeholder="Ex: Bolo no Pote Chocolate Tradicional"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-700/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Descrição/Ingredientes</label>
                      <textarea
                        rows="2"
                        value={formProduto.descricao}
                        onChange={(e) => setFormProduto({ ...formProduto, descricao: e.target.value })}
                        placeholder="Descreva as camadas, recheios..."
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-700/30"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">Preço (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formProduto.preco}
                          onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })}
                          placeholder="0.00"
                          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-700/30"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Disponibilidade</label>
                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={formProduto.disponivel}
                            onChange={(e) => setFormProduto({ ...formProduto, disponivel: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-2 text-xs font-semibold text-stone-600">
                            {formProduto.disponivel ? 'Disponível' : 'Indisponível'}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">URL da Imagem</label>
                      <input
                        type="text"
                        value={formProduto.imagem_url}
                        onChange={(e) => setFormProduto({ ...formProduto, imagem_url: e.target.value })}
                        placeholder="https://exemplo.com/foto.jpg ou /imagens/foto.jpg"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-700/30"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">Insira o endereço de uma foto online ou caminho local (ex: /imagens/foto.jpg).</p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 mt-4"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Produto</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            ABA 2: CONTROLE DE FIADOS
            =================================================================== */}
        {abaAtiva === 'fiados' && (
          <div className="space-y-6">
            
            {/* Header Módulo de Fiados com Contador na Rua */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-stone-200 pb-5">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-bold font-serif text-amber-950">Módulo de Controle de Fiados</h3>
                <p className="text-xs text-stone-500 mt-0.5">Gerencie a caderneta de clientes recorrentes e saldo pendente.</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Total Acumulado "Na Rua"</span>
                  <p className="text-2xl font-black text-rose-950">R$ {totalNaRua.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Layout Fiados (Lista lateral e Detalhes) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Painel Esquerdo: Lista de Clientes */}
              <div className="bg-white rounded-3xl p-5 border border-amber-100/50 shadow-xs flex flex-col space-y-4 max-h-[70vh]">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-950 text-sm uppercase tracking-wide">Clientes Recorrentes</h4>
                  <button
                    onClick={() => setIsCriandoCliente(!isCriandoCliente)}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors border border-amber-100"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Formulário Novo Cliente */}
                {isCriandoCliente && (
                  <form onSubmit={handleCriarCliente} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Nome do cliente"
                        value={formNovoCliente.nome}
                        onChange={(e) => setFormNovoCliente({ ...formNovoCliente, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Telefone (DDD)"
                        value={formNovoCliente.telefone}
                        onChange={(e) => setFormNovoCliente({ ...formNovoCliente, telefone: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCriandoCliente(false)}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* Busca */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Pesquisar cliente..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl bg-stone-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                  />
                </div>

                {/* Lista de Clientes */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {clientesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : clientesFiltrados.length === 0 ? (
                    <p className="text-center py-6 text-xs text-stone-400">Nenhum cliente encontrado.</p>
                  ) : (
                    clientesFiltrados.map(cliente => (
                      <button
                        key={cliente.id}
                        onClick={() => setClienteSelecionado(cliente)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          clienteSelecionado?.id === cliente.id 
                            ? 'bg-amber-700 border-amber-700 text-white font-bold shadow-md' 
                            : 'border-stone-100 bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-amber-950'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm truncate font-medium">{cliente.nome}</p>
                          <p className={`text-[10px] ${clienteSelecionado?.id === cliente.id ? 'text-amber-200' : 'text-stone-400'}`}>
                            {cliente.telefone || 'Sem telefone'}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${clienteSelecionado?.id === cliente.id ? 'text-white' : 'text-stone-400'}`} />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Painel Direito: Histórico de Dívidas e Lançamento */}
              <div className="lg:col-span-2 space-y-6">
                {clienteSelecionado ? (
                  <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs space-y-6">
                    {/* Header Painel */}
                    <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                      <div>
                        <h4 className="text-lg font-bold font-serif text-amber-950">{clienteSelecionado.nome}</h4>
                        <p className="text-xs text-stone-500 mt-0.5">Telefone: {clienteSelecionado.telefone || 'Não informado'}</p>
                      </div>
                      
                      {/* Dívida Atual do Cliente */}
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Saldo Devido</span>
                        <p className="text-xl font-black text-rose-600">
                          R$ {dividas.filter(d => d.status === 'pendente').reduce((sum, d) => sum + Number(d.valor), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Formulário de Nova Dívida */}
                    <div className="bg-stone-50/70 border border-stone-100 rounded-2xl p-4">
                      <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3">Registrar Dívida (Pendência)</h5>
                      <form onSubmit={handleLancarDivida} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">O que levou? (Descrição)</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: 2x Bolo Ninho + 1 Prestígio"
                            value={formDivida.descricao}
                            onChange={(e) => setFormDivida({ ...formDivida, descricao: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Valor (R$)</label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              required
                              placeholder="0.00"
                              value={formDivida.valor}
                              onChange={(e) => setFormDivida({ ...formDivida, valor: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-700"
                            />
                            <button
                              type="submit"
                              className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shrink-0"
                            >
                              Lançar
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Histórico detalhado de Dívidas */}
                    <div>
                      <h5 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-3.5">Histórico da Caderneta</h5>
                      
                      {dividasLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : dividas.length === 0 ? (
                        <p className="text-center py-6 text-xs text-stone-400">Nenhuma compra pendente ou paga para este cliente.</p>
                      ) : (
                        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                          {dividas.map(divida => (
                            <div
                              key={divida.id}
                              className={`p-4 rounded-2xl border flex justify-between items-center ${
                                divida.status === 'pendente'
                                  ? 'bg-rose-50/50 border-rose-100 text-rose-950'
                                  : 'bg-stone-50 border-stone-100 text-stone-600'
                              }`}
                            >
                              <div className="space-y-1">
                                <p className="text-xs font-bold">{divida.descricao}</p>
                                <div className="flex items-center space-x-3 text-[10px] text-stone-400">
                                  <span className="flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                    {new Date(divida.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                  {divida.status === 'pago' && (
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                      Pago em {new Date(divida.data_pagamento).toLocaleDateString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <span className={`text-sm font-black ${divida.status === 'pendente' ? 'text-rose-700' : 'text-stone-500'}`}>
                                  R$ {Number(divida.valor).toFixed(2)}
                                </span>

                                {divida.status === 'pendente' && (
                                  <button
                                    onClick={() => handlePagarDivida(divida.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center"
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Quitar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl py-20 px-8 text-center border border-amber-100/50 text-stone-400 shadow-xs flex flex-col items-center justify-center">
                    <User className="w-12 h-12 text-stone-200 mb-3" />
                    <p className="font-medium text-stone-600">Selecione um cliente para ver a caderneta</p>
                    <p className="text-xs text-stone-400 mt-1">Busque na lista ao lado ou registre um novo cliente.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            ABA 3: PAINEL ESTATÍSTICO (DASHBOARD)
            =================================================================== */}
        {abaAtiva === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-2xl font-bold font-serif text-amber-950">Estatísticas do Negócio</h3>
              <p className="text-xs text-stone-500 mt-0.5">Visão geral sobre faturamento e desempenho de sabores.</p>
            </div>

            {dashboardLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cards Financeiros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card Faturamento */}
                  <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Faturamento Geral</span>
                      <p className="text-3xl font-black text-amber-950 mt-1">R$ {totalFaturado.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Card Pedidos */}
                  <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total de Vendas</span>
                      <p className="text-3xl font-black text-amber-950 mt-1">{totalPedidos} pedidos</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shadow-inner">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Fiado Ativo */}
                  <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Fiados na rua</span>
                      <p className="text-3xl font-black text-rose-600 mt-1">R$ {totalNaRua.toFixed(2)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                      <User className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Gráficos / Sabores mais vendidos */}
                <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs">
                  <h4 className="font-bold text-amber-950 text-base font-serif mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-amber-700" />
                    Desempenho dos Sabores (Mais Vendidos)
                  </h4>

                  {maisVendidos.length === 0 ? (
                    <p className="text-center py-8 text-stone-400 text-sm">Nenhum dado de venda para contabilizar no momento.</p>
                  ) : (
                    <div className="space-y-4">
                      {maisVendidos.map((item, index) => {
                        const maxQtd = maisVendidos[0].quantidade;
                        const porcentagem = maxQtd > 0 ? (item.quantidade / maxQtd) * 100 : 0;
                        
                        return (
                          <div key={item.nome} className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-stone-700 flex items-center">
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-black mr-2">
                                  {index + 1}
                                </span>
                                {item.nome}
                              </span>
                              <span className="text-amber-950 font-bold">{item.quantidade} unidades</span>
                            </div>
                            {/* Barra de progresso */}
                            <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden">
                              <div
                                style={{ width: `${porcentagem}%` }}
                                className="bg-gradient-to-r from-amber-700 to-amber-600 h-full rounded-full transition-all duration-500 shadow-xs"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Histórico Recente de Pedidos */}
                <div className="bg-white rounded-3xl p-6 border border-amber-100/50 shadow-xs">
                  <h4 className="font-bold text-amber-950 text-base font-serif mb-4 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2 text-amber-700" />
                    Vendas Recentes
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-2">Cliente</th>
                          <th className="py-3 px-2">Itens</th>
                          <th className="py-3 px-2">Método</th>
                          <th className="py-3 px-2">Total</th>
                          <th className="py-3 px-2">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendas.slice(0, 10).map((venda) => (
                          <tr key={venda.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                            <td className="py-3.5 px-2 font-bold text-stone-700">{venda.cliente_nome}</td>
                            <td className="py-3.5 px-2 max-w-[200px] truncate text-stone-500">
                              {venda.itens?.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')}
                            </td>
                            <td className="py-3.5 px-2">
                              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                venda.forma_pagamento === 'pix' ? 'bg-emerald-50 text-emerald-700' :
                                venda.forma_pagamento === 'cartao' ? 'bg-amber-50 text-amber-700' :
                                'bg-rose-50 text-rose-700'
                              }`}>
                                {venda.forma_pagamento}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 font-bold text-stone-700">R$ {Number(venda.total).toFixed(2)}</td>
                            <td className="py-3.5 px-2 text-stone-400">
                              {new Date(venda.created_at).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
