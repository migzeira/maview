import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MaviewLogo from "@/components/MaviewLogo";

const Termos = () => (
  <>
    <Helmet>
      <title>Termos de Uso | Maview</title>
      <meta name="description" content="Termos de Uso da plataforma Maview." />
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
        <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-10">Última atualização: abril de 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma Maview, você declara que leu, compreendeu e concorda
              integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, você
              não deve utilizar nossos serviços. O uso continuado da plataforma após eventuais alterações
              constitui aceitação dos termos revisados.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descrição do Serviço</h2>
            <p>
              A Maview é uma plataforma digital que permite a criação de vitrines online personalizadas
              (link-in-bio), catálogos de produtos e páginas de vendas. O serviço inclui ferramentas de
              personalização visual, gerenciamento de produtos, integração com meios de pagamento,
              analytics e recursos de automação para impulsionar negócios digitais.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Conta do Usuário</h2>
            <p className="mb-3">
              Para utilizar a Maview, é necessário criar uma conta fornecendo informações verdadeiras e
              atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de
              acesso e por todas as atividades realizadas em sua conta.
            </p>
            <p>
              A Maview reserva-se o direito de suspender ou encerrar contas que violem estes Termos,
              apresentem atividade fraudulenta ou permaneçam inativas por período superior a 12 meses
              consecutivos.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Conteúdo do Usuário</h2>
            <p className="mb-3">
              Você mantém a propriedade de todo conteúdo que publica na plataforma, incluindo textos,
              imagens, logotipos e descrições de produtos. Ao publicar conteúdo, você concede à Maview
              uma licença não exclusiva e revogável para exibir, distribuir e reproduzir esse conteúdo
              exclusivamente para a prestação do serviço.
            </p>
            <p>
              É proibido publicar conteúdo ilegal, difamatório, que viole direitos de terceiros ou que
              promova discriminação, violência ou atividades ilegais. A Maview pode remover qualquer
              conteúdo que viole estas diretrizes sem aviso prévio.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Pagamentos</h2>
            <p className="mb-3">
              A Maview pode oferecer planos gratuitos e pagos. Os valores, ciclos de cobrança e recursos
              incluídos em cada plano estão descritos na página de preços da plataforma. Alterações de
              preço serão comunicadas com antecedência mínima de 30 dias.
            </p>
            <p>
              Transações de venda realizadas através da vitrine do usuário são processadas por
              provedores de pagamento terceiros. A Maview não armazena dados de cartão de crédito e
              não se responsabiliza por eventuais disputas entre o vendedor e seus clientes finais.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Propriedade Intelectual</h2>
            <p>
              Todo o design, código-fonte, logotipos, marcas e conteúdo produzido pela Maview são de
              propriedade exclusiva da plataforma e protegidos pelas leis de propriedade intelectual
              brasileiras. É proibida a reprodução, modificação ou distribuição sem autorização prévia
              por escrito.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitação de Responsabilidade</h2>
            <p className="mb-3">
              A Maview é fornecida "como está". Não garantimos que o serviço será ininterrupto ou
              livre de erros. Em nenhuma hipótese a Maview será responsável por danos indiretos,
              incidentais, especiais ou consequenciais decorrentes do uso ou da impossibilidade de uso
              da plataforma.
            </p>
            <p>
              A responsabilidade total da Maview em qualquer reclamação relacionada ao serviço será
              limitada ao valor pago pelo usuário nos 12 meses anteriores ao evento que originou a
              reclamação.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Modificações</h2>
            <p>
              A Maview pode atualizar estes Termos de Uso a qualquer momento. Alterações substanciais
              serão comunicadas por e-mail ou por aviso na plataforma com antecedência razoável. O uso
              continuado do serviço após a publicação das alterações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos, entre em contato conosco pelo e-mail{" "}
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
            <Link to="/privacidade" className="hover:text-purple-400 transition-colors">
              Política de Privacidade
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

export default Termos;
