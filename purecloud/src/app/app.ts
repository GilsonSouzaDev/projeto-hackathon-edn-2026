
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';

import * as marked from 'marked';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);


  inputText = signal<string>('');
  isLoading = signal<boolean>(false);
  processedContent = signal<SafeHtml>('');
  citations = signal<string[]>([]);

  processData() {
    const questionValue = this.inputText().trim();
    if (!questionValue) return;

    this.isLoading.set(true);
    this.processedContent.set('');
    this.citations.set([]);

    const payload = { question: questionValue };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>('/api-aws/Dev/query', payload, { headers }).subscribe({
      next: (res) => {
        // 1. TRATAMENTO DA RESPOSTA (String Markdown)
        const rawAnswer = res.answer || '';
        const htmlResult = marked.parse(rawAnswer) as string;
        this.processedContent.set(this.sanitizer.bypassSecurityTrustHtml(htmlResult));

        // 2. TRATAMENTO DAS CITAÇÕES (Escavando o Objeto AWS)
        // O caminho no seu console é: citations[] -> retrievedReferences[] -> metadata.fonte
        const rawCitations = res.citations || [];

        const extractedFiles = rawCitations.flatMap((item: any) =>
          item.retrievedReferences.map((ref: any) => {
            const fullPath = ref.metadata?.fonte || 'Documento não identificado';
            // Extrai apenas o nome do arquivo da URL do S3 (ex: "ETC-5-Jorn-Acad-2025.pdf")
            return fullPath.split('/').pop();
          }),
        );

        // Remove duplicatas (caso o mesmo arquivo seja citado em parágrafos diferentes)
        const uniqueFiles = [...new Set(extractedFiles)] as string[];

        this.citations.set(uniqueFiles);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro SÒJJA:', err);
        this.isLoading.set(false);
      },
    });
  }

  reset() {
    this.processedContent.set('');
    this.citations.set([]);
    this.inputText.set('');
    this.isLoading.set(false);
  }
}
