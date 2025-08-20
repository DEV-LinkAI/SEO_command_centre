// import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">SEO Command Centre</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Welkom bij het SEO Command Centre</h2>
          <p className="text-gray-600 mb-4">
            Deze app bevat:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Next.js 14 met App Router</li>
            <li>Tailwind CSS voor styling</li>
            <li>ShadCN/UI componenten</li>
            <li>Supabase authenticatie (configuratie klaar)</li>
            <li>Plus Jakarta Sans font</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Test de banner</h3>
          <p className="text-gray-600">
            Klik op de &quot;Automatisering aanvragen&quot; button in de banner bovenaan om de navigatie te testen.
          </p>
        </div>
      </div>
    </div>
  );
}
