"use client";
import React, { useState } from 'react';
import { analyzeCase, uploadDocumentMetas } from '@/lib/api';

type Doc = { id: string; name: string; summary?: string };

export default function CaseWizard() {
  const [caseType, setCaseType] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [statement, setStatement] = useState<string>('');
  const [lang, setLang] = useState<string>('auto');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onFilesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const metas = selectedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }));
      const resp = await uploadDocumentMetas(metas);
      setDocuments(resp.documents || []);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const submitStatement = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await analyzeCase({
        statement,
        caseType: caseType || 'general',
        documents,
        lang,
      });
      setResult(resp);
    } catch (e: any) {
      setError(e?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-4 p-4 bg-white rounded shadow'>
      <div>
        <label className='block font-medium'>Select Case Type</label>
        <select value={caseType || ''} onChange={(e) => setCaseType(e.target.value)} className='mt-1 p-2 border rounded'>
          <option value=''>-- choose --</option>
          <option value='divorce'>Divorce</option>
          <option value='rental_loan'>Property / Rental / Loan</option>
          <option value='general'>General</option>
        </select>
      </div>

      <div>
        <label className='block font-medium'>Upload Documents (names only, no storage)</label>
        <input type='file' multiple accept='.pdf,image/*,.docx,.txt' onChange={onFilesChange} />
        <div className='mt-2'>
          <button className='px-3 py-2 bg-green-600 text-white rounded' onClick={uploadFiles} disabled={!selectedFiles.length || loading}>
            {loading ? 'Processing...' : 'Parse Filenames'}
          </button>
        </div>
      </div>

      <div>
        <label className='block font-medium'>Your Statement (any language)</label>
        <textarea value={statement} onChange={(e) => setStatement(e.target.value)} rows={6} className='w-full p-2 border rounded'></textarea>
        <div className='mt-2 flex gap-2'>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className='p-2 border rounded'>
            <option value='auto'>Auto-detect</option>
            <option value='en'>English</option>
            <option value='hi'>Hindi</option>
            <option value='bn'>Bengali</option>
            <option value='ta'>Tamil</option>
          </select>
          <button className='px-3 py-2 bg-blue-600 text-white rounded' onClick={submitStatement} disabled={loading || !statement}>
            {loading ? 'Analyzing...' : 'Analyze Statement & Docs'}
          </button>
        </div>
      </div>

      <div>
        <h4 className='font-semibold'>Parsed Documents</h4>
        <ul>
          {documents.map((d) => (
            <li key={d.id} className='p-2 border rounded my-1'>
              <strong>{d.name}</strong> — {d.summary?.slice(0, 120)}...
            </li>
          ))}
        </ul>
      </div>

      {error && <div className='text-red-600'>{error}</div>}

      {result && (
        <div className='mt-4 p-3 border rounded bg-gray-50'>
          <h4 className='font-semibold'>Drafted Statement</h4>
          <p className='whitespace-pre-wrap'>{result.draftedStatement}</p>
          <h4 className='font-semibold mt-3'>Missing Documents</h4>
          <ul className='list-disc pl-6'>
            {result.missingDocuments?.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <h4 className='font-semibold mt-3'>Risks</h4>
          <ul className='list-disc pl-6'>
            {result.risks?.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <h4 className='font-semibold mt-3'>Recommendations</h4>
          <ul className='list-disc pl-6'>
            {result.recommendations?.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className='mt-3 text-sm'>Estimated win probability: <strong>{Math.round((result.winProbability ?? 0) * 100)}%</strong></div>
        </div>
      )}
    </div>
  );
}