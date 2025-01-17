'use client';

import type { DataConnection, Peer } from 'peerjs';

import { create } from 'zustand';

interface FriendPeer {
  peerId: string;
  connection: DataConnection | null;
  isConnected: boolean;
  isExpired: boolean;
}

interface PeerStore {
  peer: Peer | null;
  setPeer: (peer: Peer | null) => void;

  friendConnectionMap: Map<string, FriendPeer>;
  setFriendConnectionMap: (
    setStateAction: (prevMap: Map<string, FriendPeer>) => void,
  ) => void;
}

export const usePeerStore = create<PeerStore>((set) => {
  //* 동시성 이슈를 해결하기 위해 해당 Map객체만을 참조, 수정하여 상태값으로 사용
  const baseConnectedPeerMap = new Map<string, FriendPeer>();

  return {
    peer: null,
    setPeer: (peer) => set({ peer }),

    friendConnectionMap: baseConnectedPeerMap,
    setFriendConnectionMap: (setStateAction) => {
      setStateAction(baseConnectedPeerMap);

      set({
        friendConnectionMap: new Map(baseConnectedPeerMap),
      });
    },
  };
});
