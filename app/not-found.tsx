'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 -mt-20">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/Empresa/01.png"
          alt="USS Brasil"
          width={120}
          height={48}
          className="opacity-80"
        />
      </div>

      {/* 404 */}
      <h1 className="text-[8rem] sm:text-[10rem] md:text-[12rem] font-extralight text-blue-400 leading-none tracking-tighter">
        404
      </h1>

      {/* Divider */}
      <div className="w-16 h-0.5 bg-blue-400/30 my-6" />

      {/* Message */}
      <p className="text-gray-500 text-lg font-light mb-10 text-center">
        A página que você procura não existe
      </p>

      {/* Back Button */}
      <Link 
        href="/"
        className="group flex items-center gap-3 text-blue-400 hover:text-blue-500 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">Voltar ao início</span>
      </Link>
    </div>
  )
}
