
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Trash2, Eye, CheckCircle, Loader2, Calendar, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: 'new' | 'read' | 'replied';
    createdAt: any;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const firestore = useFirestore();

    useEffect(() => {
        fetchMessages();
    }, [firestore]);

    const fetchMessages = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const messagesRef = collection(firestore, 'messages');
            const q = query(messagesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const messagesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContactMessage[];
            setMessages(messagesData);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Erreur lors du chargement des messages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (message: ContactMessage) => {
        if (!firestore) return;
        try {
            await updateDoc(doc(firestore, 'messages', message.id), { status: 'read' });
            setMessages(messages.map(m => m.id === message.id ? { ...m, status: 'read' } : m));
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!firestore || !window.confirm('Supprimer ce message ?')) return;

        try {
            await deleteDoc(doc(firestore, 'messages', id));
            toast.success('Message supprimé');
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const openMessage = (message: ContactMessage) => {
        setSelectedMessage(message);
        if (message.status === 'new') {
            handleMarkAsRead(message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Messages Reçus</h2>
                <p className="text-slate-500">Gérez les demandes de contact et questions des visiteurs.</p>
            </div>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-emerald-600" />
                        <CardTitle className="text-lg font-semibold">Boîte de réception</CardTitle>
                    </div>
                    <CardDescription>Vous avez {messages.filter(m => m.status === 'new').length} nouveau(x) message(s).</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                            <p className="text-slate-500 font-medium font-outfit uppercase tracking-widest text-[10px]">Chargement des messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500">Aucun message pour le moment.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6 py-4">Expéditeur</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.map((msg) => (
                                    <TableRow
                                        key={msg.id}
                                        className={`group cursor-pointer transition-colors hover:bg-slate-50 ${msg.status === 'new' ? 'bg-emerald-50/30' : ''}`}
                                        onClick={() => openMessage(msg)}
                                    >
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={`font-bold ${msg.status === 'new' ? 'text-slate-900' : 'text-slate-600'}`}>{msg.name}</span>
                                                <span className="text-xs text-slate-500">{msg.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <span className={`text-sm line-clamp-1 ${msg.status === 'new' ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                                                {msg.message}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs">
                                                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'dd MMM HH:mm', { locale: fr }) : 'Récemment'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={msg.status === 'new' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                                                {msg.status === 'new' ? 'Nouveau' : 'Lu'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(msg.id, e)}>
                                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                {selectedMessage && (
                    <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
                        <div className="bg-emerald-600 p-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <Badge className="bg-white/20 text-white border-none px-3 py-1 font-bold uppercase tracking-widest text-[10px]">Détails du message</Badge>
                                <p className="text-emerald-100 text-xs font-medium">
                                    {selectedMessage.createdAt?.toDate ? format(selectedMessage.createdAt.toDate(), 'PPP à HH:mm', { locale: fr }) : ''}
                                </p>
                            </div>
                            <h3 className="text-3xl font-black mb-2">{selectedMessage.name}</h3>
                            <div className="flex flex-wrap gap-4 text-emerald-100">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4" />
                                    {selectedMessage.email}
                                </div>
                                {selectedMessage.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4" />
                                        {selectedMessage.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[200px]">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <Button
                                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-widest text-xs h-12"
                                    asChild
                                >
                                    <a href={`mailto:${selectedMessage.email}`}>Répondre par Email</a>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl border-slate-200 font-bold uppercase tracking-widest text-xs h-12"
                                    onClick={() => setSelectedMessage(null)}
                                >
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
