import { getEvents } from "@/app/actions/get-events";
import SearchHome from "@/components/User/SearchHome";
import PaginatedEvents from "@/components/PaginatedEvents";

export default async function Home() {
  // Get initial data on the server side
  const initialData = await getEvents(1, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Section */}
      <div className="w-full px-6 py-8">
        <SearchHome />
      </div>

      {/* Paginated Events Component */}
      <PaginatedEvents initialData={initialData} />

      {/* Footer Section */}
      <div className="w-full px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white text-center">
            <h3 className="text-xl font-semibold mb-2">
              Ready to discover more events?
            </h3>
            <p className="text-purple-100">
              Join thousands of event-goers and never miss out on amazing
              experiences!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
