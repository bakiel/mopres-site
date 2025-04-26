import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button'; // Assuming Button component exists

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      <div className="max-w-md w-full">
        <Image
          src="/404_error_with_cartoon_shoe.png"
          alt="Page Not Found Illustration"
          width={300} // Adjust width as needed
          height={300} // Adjust height as needed
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-montserrat">Oops! Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like the page you were searching for doesn't exist or has been moved.
        </p>
        <Link href="/" passHref>
          <Button variant="primary">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
