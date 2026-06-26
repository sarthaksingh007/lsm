export function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function inr2(n: number): string {
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function statusColor(status: string): string {
  switch (status) {
    case 'applied':
      return 'bg-yellow-100 text-yellow-800';
    case 'sanctioned':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'disbursed':
      return 'bg-purple-100 text-purple-800';
    case 'closed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
