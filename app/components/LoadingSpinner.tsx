export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}



