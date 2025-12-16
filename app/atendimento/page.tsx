"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Phone, Mail, Clock, MapPin } from "lucide-react";
import { useState } from "react";


export default function AtendimentoPage() {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  const whatsappNumber = "5548991832760"; // Número oficial USS Brasil

  const handleWhatsAppRedirect = () => {
    const texto = encodeURIComponent(
      `Olá! Meu nome é ${nome || "Cliente"}. ${mensagem || "Gostaria de mais informações."}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${texto}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Atendimento ao Cliente</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco e nossa equipe de suporte
            responderá o mais rápido possível.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageCircle className="h-6 w-6 text-green-600" />
                Fale Conosco via WhatsApp
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para iniciar uma conversa com nossa equipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Seu Nome</Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Sua Mensagem</Label>
                <Textarea
                  id="mensagem"
                  placeholder="Como podemos ajudar?"
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
              </div>
              <Button
                onClick={handleWhatsAppRedirect}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Iniciar Conversa no WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info Card */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Telefone / WhatsApp</h3>
                    <p className="text-gray-600">(11) 99999-9999</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-gray-600">contato@ussbrasil.com.br</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Horário de Atendimento</h3>
                    <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                    <p className="text-gray-600">Sábado: 8h às 12h</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Endereço</h3>
                    <p className="text-gray-600">
                      Rua Exemplo, 123 - Centro
                      <br />
                      São Paulo - SP, 01234-567
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="shadow-lg bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl text-green-800">Dúvidas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-700">
                  <li className="hover:underline cursor-pointer">• Como rastrear meu pedido?</li>
                  <li className="hover:underline cursor-pointer">• Política de trocas e devoluções</li>
                  <li className="hover:underline cursor-pointer">• Formas de pagamento</li>
                  <li className="hover:underline cursor-pointer">• Prazo de entrega</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Prefere atendimento imediato?</h2>
          <p className="text-gray-600 mb-6">
            Clique no botão abaixo para falar diretamente com um de nossos atendentes
          </p>
          <Button
            onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
          >
            <MessageCircle className="mr-2 h-6 w-6" />
            Chamar no WhatsApp Agora
          </Button>
        </div>
      </section>
    </div>
  );
}