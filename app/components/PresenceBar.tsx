'use client';

import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

type PresenceUser = {
  id: string;
  name: string;
};

// Simple initials helper
function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PresenceBar() {
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [selfId, setSelfId] = useState<string>('');

  useEffect(() => {
    let storedId = localStorage.getItem('rf_presence_id');
    if (!storedId) {
      storedId = `user-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('rf_presence_id', storedId);
    }
    setSelfId(storedId);
  }, []);

  useEffect(() => {
    if (!selfId) return;
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn('Pusher key ontbreekt; presence uitgeschakeld');
      return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: '/api/pusher-auth',
      auth: {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    });

    const channel = pusher.subscribe('presence-rankflow');

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const list: PresenceUser[] = [];
      members.each((m: any) => list.push({ id: m.id, name: m.info?.name || m.id }));
      setOnline(list);
    });

    channel.bind('pusher:member_added', (member: any) => {
      setOnline((prev) => [...prev, { id: member.id, name: member.info?.name || member.id }]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setOnline((prev) => prev.filter((u) => u.id !== member.id));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [selfId]);

  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        marginBottom: '1rem',
      }}
    >
      <span style={{ fontWeight: 600, color: '#1e293b' }}>Online:</span>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {online.map((user) => (
          <div
            key={user.id}
            title={user.name}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: user.id === selfId ? '#0ea5e9' : '#94a3b8',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {initials(user.name)}
          </div>
        ))}
      </div>
      <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#475569' }}>
        {online.length} actief
      </span>
    </div>
  );
}

