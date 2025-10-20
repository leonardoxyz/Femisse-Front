import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TurnstileWidget from '@/components/TurnstileWidget';
import { TurnstileInstance } from '@marsidev/react-turnstile';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import { tokenStorage } from '@/utils/tokenStorage';

const AuthPage = () => {
  const { isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    // data_nascimento: '',
    // cpf: '',
    // telefone: '',
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Redireciona se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/perfil', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) {
      setError(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Faz o login
      const response = await axios.post(`${API_ENDPOINTS.auth}/login`, {
        email: form.email,
        senha: form.senha,
        rememberMe: rememberMe,
      }, {
        withCredentials: true,
      });
      
      // ✅ MOBILE FIX: Salva tokens em armazenamento seguro como fallback
      if (response.data.accessToken || response.data.refreshToken) {
        tokenStorage.setTokens({
          accessToken: response.data.accessToken ?? null,
          refreshToken: response.data.refreshToken ?? null,
        });
      }
      
      // Aguarda um pouco para cookies serem processados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenta atualizar o contexto (não bloqueia se falhar)
      if (refreshUser) {
        try {
          await refreshUser();
        } catch (refreshError) {
          console.warn('Aviso ao atualizar contexto:', refreshError);
        }
      }
      
      // Navega para o perfil
      navigate('/perfil', { replace: true });
      
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    
    // Verifica se o Turnstile foi validado
    if (!turnstileToken) {
      setError('Por favor, complete a verificação de segurança.');
      return;
    }
    
    setLoading(true); setError(null); setSuccess(null);
    try {
      await axios.post(`${API_ENDPOINTS.auth}/register`, {
        nome: form.nome,
        // data_nascimento: form.data_nascimento,
        // cpf: form.cpf,
        // telefone: form.telefone,
        email: form.email,
        senha: form.senha,
        turnstileToken: turnstileToken, // Envia o token do Turnstile
      });
      setSuccess('Cadastro realizado! Faça login.');
      setTab('login');
      setTurnstileToken(null); // Reset do token
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
      setTurnstileToken(null); // Reset do token em caso de erro
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-12 flex-grow flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding */}
            <div className="hidden lg:block">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-gray-800">
                    Bem-vinda à <span style={{ color: '#58090d' }}>Femisse</span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Descubra as últimas tendências em moda feminina. 
                    Peças exclusivas, qualidade premium e estilo único.
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold" style={{ color: '#58090d' }}>500+</div>
                      <div className="text-sm text-gray-600">Produtos</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold" style={{ color: '#58090d' }}>10k+</div>
                      <div className="text-sm text-gray-600">Clientes</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold" style={{ color: '#58090d' }}>5★</div>
                      <div className="text-sm text-gray-600">Avaliação</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-sm border-0">
                
                {/* Mobile Title */}
                <div className="lg:hidden text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">
                    <span style={{ color: '#58090d' }}>Femisse</span>
                  </h1>
                  <p className="text-gray-600 mt-2">Moda feminina exclusiva</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                  <button
                    className={`flex-1 py-3 text-center font-semibold rounded-md transition-all duration-200 ${
                      tab === 'login' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: tab === 'login' ? '#58090d' : undefined }}
                    onClick={() => setTab('login')}
                  >
                    Fazer Login
                  </button>
                  <button
                    className={`flex-1 py-3 text-center font-semibold rounded-md transition-all duration-200 ${
                      tab === 'register' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={{ color: tab === 'register' ? '#58090d' : undefined }}
                    onClick={() => setTab('register')}
                  >
                    Criar Conta
                  </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {/* Login Form */}
                {tab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          placeholder="Seu e-mail"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                      </div>
                      
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="senha"
                          placeholder="Sua senha"
                          value={form.senha}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-gray-300 focus:ring-2 cursor-pointer"
                          style={{ 
                            color: '#58090d',
                            '--tw-ring-color': '#58090d'
                          } as any}
                        />
                        <span className="ml-2 text-gray-600">Lembrar de mim</span>
                      </label>
                      <a href="#" style={{ color: '#58090d' }} className="hover:opacity-80 font-medium">
                        Esqueci a senha
                      </a>
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
                      style={{ backgroundColor: '#58090d' }}
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar na minha conta'}
                    </Button>
                  </form>
                ) : (
                  /* Register Form */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          name="nome"
                          placeholder="Nome completo"
                          value={form.nome}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="date"
                            name="data_nascimento"
                            value={form.data_nascimento}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70 text-sm"
                            required
                          />
                        </div> */}

                        {/* <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="cpf"
                            placeholder="CPF"
                            value={form.cpf}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                            required
                          />
                        </div> */}
                      </div>

                      {/* <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="tel"
                          name="telefone"
                          placeholder="Telefone"
                          value={form.telefone}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                      </div> */}

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          name="email"
                          placeholder="E-mail"
                          value={form.email}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                      </div>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="senha"
                          placeholder="Senha"
                          value={form.senha}
                          onChange={handleChange}
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/70"
                          style={{ '--tw-ring-color': '#58090d' } as any}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Turnstile Widget */}
                    <div className="mt-4">
                      <TurnstileWidget
                        ref={turnstileRef}
                        onVerify={(token) => {
                          setTurnstileToken(token);
                          setError(null); // Limpa erros quando verificado
                        }}
                        onError={() => {
                          setTurnstileToken(null);
                          setError('Erro na verificação de segurança. Tente novamente.');
                        }}
                        onExpire={() => {
                          setTurnstileToken(null);
                          setError('Verificação de segurança expirou. Complete novamente.');
                        }}
                        className="flex justify-center"
                      />
                    </div>

                    <div className="text-xs text-gray-600 leading-relaxed">
                      Ao criar uma conta, você concorda com nossos{' '}
                      <a href="#" style={{ color: '#58090d' }} className="hover:opacity-80 font-medium">
                        Termos de Uso
                      </a>{' '}
                      e{' '}
                      <a href="#" style={{ color: '#58090d' }} className="hover:opacity-80 font-medium">
                        Política de Privacidade
                      </a>
                      .
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:opacity-90"
                      style={{ backgroundColor: '#58090d' }}
                      disabled={loading || !turnstileToken}
                    >
                      {loading ? 'Criando conta...' : 'Criar minha conta'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
