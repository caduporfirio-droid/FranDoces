-- BANCO DE DADOS - CARDÁPIO DIGITAL & GESTÃO (FRAN DOCES)
-- Execute este script no SQL Editor do seu projeto Supabase.

-- =========================================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =========================================================================

-- Tabela de Produtos (Cardápio)
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    disponivel BOOLEAN DEFAULT TRUE NOT NULL,
    imagem_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de Clientes para Controle de Fiados
CREATE TABLE IF NOT EXISTS public.clientes_fiado (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de Registro de Dívidas (Fiados)
CREATE TABLE IF NOT EXISTS public.dividas_fiado (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES public.clientes_fiado(id) ON DELETE CASCADE NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')) NOT NULL,
    data_pagamento TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de Vendas/Pedidos (Dashboard e Histórico)
CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_nome TEXT NOT NULL,
    itens JSONB NOT NULL, 
    -- Formato dos itens: [{ "produto_id": "...", "nome": "...", "quantidade": 2, "preco_unitario": 15.00 }]
    total NUMERIC(10, 2) NOT NULL,
    forma_pagamento TEXT CHECK (forma_pagamento IN ('pix', 'cartao', 'fiado')) NOT NULL,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- 2. SEGURANÇA E POLÍTICAS DE ACESSO (RLS - Row Level Security)
-- =========================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_fiado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas_fiado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

-- 2.1 Políticas para a tabela PRODUTOS
-- Qualquer usuário (mesmo não autenticado) pode ver os produtos
CREATE POLICY "Permitir leitura pública de produtos" 
ON public.produtos FOR SELECT 
USING (true);

-- Apenas usuários autenticados (admin) podem alterar produtos
CREATE POLICY "Permitir CRUD de produtos apenas para admins" 
ON public.produtos FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 2.2 Políticas para a tabela CLIENTES_FIADO
-- Apenas usuários autenticados (admin) podem gerenciar clientes de fiados
CREATE POLICY "Permitir gerenciamento de clientes apenas para admins" 
ON public.clientes_fiado FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 2.3 Políticas para a tabela DIVIDAS_FIADO
-- Apenas usuários autenticados (admin) podem gerenciar as dívidas
CREATE POLICY "Permitir gerenciamento de dívidas apenas para admins" 
ON public.dividas_fiado FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- 2.4 Políticas para a tabela VENDAS
-- Qualquer usuário pode registrar uma nova venda (cliente fazendo checkout)
CREATE POLICY "Permitir inserção de vendas pelo cliente" 
ON public.vendas FOR INSERT 
WITH CHECK (true);

-- Apenas usuários autenticados (admin) podem visualizar o histórico de vendas/pedidos
CREATE POLICY "Permitir leitura de vendas apenas para admins" 
ON public.vendas FOR SELECT 
TO authenticated 
USING (true);

-- Apenas admins podem atualizar ou deletar vendas
CREATE POLICY "Permitir modificação de vendas apenas para admins" 
ON public.vendas FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- =========================================================================
-- 3. DADOS INICIAIS DE EXEMPLO (OPCIONAL)
-- =========================================================================
INSERT INTO public.produtos (nome, descricao, preco, disponivel, imagem_url) VALUES
('Bolo no Pote Ninho com Morango', 'Delicioso bolo no pote com creme aveludado de Leite Ninho gourmet e morangos frescos picados.', 15.00, true, '/imagens/Ninho com Morango.jpg'),
('Bolo no Pote Brigadeiro com Morango', 'Bolo de chocolate molhadinho com brigadeiro cremoso e pedaços de morango fresco.', 15.00, true, '/imagens/Brigadeiro com Morango.jpg'),
('Bolo no Pote Prestígio', 'Clássico bolo de chocolate recheado com creme de coco cremoso e cobertura de ganache de chocolate.', 15.00, true, '/imagens/Prestigio.jpg'),
('Bolo no Pote Brigadeiro de Maracujá', 'Equilíbrio perfeito de creme trufado de maracujá com sementes e brigadeiro.', 15.00, true, '/imagens/Brigadeiro de Maracuja.jpg'),
('Bolo no Pote Abacaxi com Coco', 'Bolo de baunilha molhado com calda de coco, pedaços de abacaxi cozidos e creme suave.', 15.00, true, '/imagens/Abacaxi com Coco.jpg'),
('Bolo no Pote Ninho com Nutella', 'Combinação irresistível de Leite Ninho cremoso com recheio autêntico de Nutella.', 15.00, true, '/imagens/Ninho com Nutella.jpg')
ON CONFLICT DO NOTHING;
