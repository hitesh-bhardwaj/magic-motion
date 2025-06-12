import Header from '@/components/Header';

export default function Success() {
    return (
        <div>
            <div className="p-4">
                <h1 className="text-2xl">Payment Successful</h1>
                <p>Your access has been granted. <a href="/dashboard" className="text-blue-500">Go to Dashboard</a></p>
            </div>
        </div>
    );
}