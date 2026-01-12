import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Lock, TrendingUp } from 'lucide-react';

export function VaultCard({ vault, isClient }) {
    return (
        <Card className="card-interactive group">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">
                        {vault.title}
                    </CardTitle>
                    <StatusBadge status={vault.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Amount Display */}
                <div className="flex items-baseline justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-3xl font-bold text-gray-900 amount-display">
                            ${vault.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked in vault</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {vault.description}
                </p>

                {/* Milestones Preview */}
                {vault.milestones && vault.milestones.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{vault.milestones.length} milestone{vault.milestones.length > 1 ? 's' : ''}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                <Link href={`/${isClient ? 'client' : 'freelancer'}/vault/${vault.id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:border-gray-400">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
