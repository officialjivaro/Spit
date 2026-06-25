// Card Model | Defines standard playing cards and display helpers
export const SUITS = [
  { id: 'clubs', symbol: '♣', color: 'black' },
  { id: 'diamonds', symbol: '♦', color: 'red' },
  { id: 'hearts', symbol: '♥', color: 'red' },
  { id: 'spades', symbol: '♠', color: 'black' }
]

export const RANKS = Array.from({ length: 13 }, (_, index) => index + 1)

export function getRankLabel(rank) {
  if (rank === 1) return 'A'
  if (rank === 11) return 'J'
  if (rank === 12) return 'Q'
  if (rank === 13) return 'K'
  return String(rank)
}

export function createStandardDeck() {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${suit.id}-${rank}`,
      suit: suit.id,
      suitSymbol: suit.symbol,
      color: suit.color,
      rank,
      rankLabel: getRankLabel(rank)
    }))
  )
}

export function getCardLabel(card) {
  if (!card) return 'Empty card slot'
  const suitName = card.suit.charAt(0).toUpperCase() + card.suit.slice(1)
  return `${card.rankLabel} of ${suitName}`
}
