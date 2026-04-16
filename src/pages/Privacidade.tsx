import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MaviewLogo from "@/components/MaviewLogo";

const Privacidade = () => (
  <>
    <Helmet>
      <title>Política de Privacidade | Maview</title>
      <meta name="description" content="Política de Privacidade da plataforma Maview." />
    </Helmet>

    <div className="min-h-screen bg-[hsl(260,30%,7%)] text-gray-300">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <MaviewLogo size={28} />
            <span className="text-white font-bold text-lg tracking-tight">Maview</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-10">Última atualização: abril de 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Dados Coletados</h2>
            <p className="mb-3">
              A Maview coleta as seguintes categorias de dados pessoais para a prestação do serviço:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><span className="text-white font-medium">Dados de cadastro:</span> nome, e-mail, nome de usuário e foto de perfil.</li>
              <li><span className="text-white font-medium">Dados de uso:</span> páginas visitadas, cliques, tempo de sessão e dispositivo utilizado.</li>
              <li><span className="text-white font-medium">Dados de transação:</span> informações de produtos cadastrados e histórico de vendas.</li>
              <li><span className="text-white font-medium">Dados técnicos:</span> endereço IP, tipo de navegador, sistema operacional e logs de acesso.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Como Usamos seus Dados</h2>
            <p className="mb-3">Utilizamos seus dados pessoais para:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Criar e gerenciar sua conta na plataforma.</li>
              <li>Personalizar sua experiência e fornecer recomendações relevantes.</li>
              <li>Processar transações e fornecer suporte ao cliente.</li>
              <li>Gerar relatórios de analytics e métricas de desempenho da sua vitrine.</li>
              <li>Enviar comunicações sobre atualizações, novos recursos e promoções (com opção de cancelamento).</li>
              <li>Garantir a segurança da plataforma e prevenir fraudes.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Compartilhamento de Dados</h2>
            <p className="mb-3">
              A Maview não vende seus dados pessoais. Podemos compartilhar informações apenas nas
              seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><span className="text-white font-medium">Provedores de serviço:</span> empresas que nos auxiliam na operação da plataforma (hospedagem, pagamentos, analytics), sob contratos de confidencialidade.</li>
              <li><span className="text-white font-medium">Obrigação legal:</span> quando exigido por lei, regulamentação ou ordem judicial.</li>
              <li><span className="text-white font-medium">Proteção de direitos:</span> para proteger os direitos, segurança ou propriedade da Maview e seus usuários.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
            <p className="mb-3">
              A Maview utiliza cookies e tecnologias semelhantes para melhorar a experiência do
              usuário. Os cookies que utilizamos incluem:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><span className="text-white font-medium">Essenciais:</span> necessários para o funcionamento da plataforma (autenticação, preferências de sessão).</li>
              <li><span className="text-white font-medium">Analíticos:</span> ajudam a entender como os visitantes interagem com a plataforma para melhorar o serviço.</li>
              <li><span className="text-white font-medium">Funcionais:</span> permitem lembrar suas preferências de personalização.</li>
            </ul>
            <p className="mt-3">
              Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              A desativação de cookies essenciais pode afetar o funcionamento da plataforma.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais
              contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui
              criptografia de dados em trânsito (TLS/SSL), controle de acesso restrito, backups
              regulares e monitoramento contínuo de segurança. Apesar de nossos esforços, nenhum
              sistema é completamente seguro, e não podemos garantir segurança absoluta.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Seus Direitos</h2>
            <p className="mb-3">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você possui os seguintes
              direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Acessar e obter uma cópia dos seus dados pessoais.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a exclusão dos seus dados pessoais.</li>
              <li>Revogar o consentimento para o tratamento de dados a qualquer momento.</li>
              <li>Solicitar a portabilidade dos seus dados para outro serviço.</li>
              <li>Opor-se ao tratamento de dados quando baseado em interesses legítimos.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
              <a
                href="mailto:suporte@maview.app"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
              >
                suporte@maview.app
              </a>.
              Responderemos sua solicitação em até 15 dias úteis.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contato</h2>
            <p>
              Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre o
              tratamento dos seus dados, entre em contato conosco pelo e-mail{" "}
              <a
                href="mailto:suporte@maview.app"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
              >
                suporte@maview.app
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Maview. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link to="/termos" className="hover:text-purple-400 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/" className="hover:text-purple-400 transition-colors">
              Voltar ao início
            </Link>
          </div>
        </div>
      </footer>
    </div>
  </>
);

export default Privacidade;
