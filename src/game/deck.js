import { createStandardDeck } from './cards.js'

// Deck Utilities | Creates deterministic-friendly shuffled decks and deals a game
export function shuffleCards(cards, random = Math.random) {
  const shuffled = [...cards]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomValue = Math.min(Math.max(Number(random()), 0), 0.999999999)
    const swapIndex = Math.floor(randomValue * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

export function dealStandardGame(random = Math.random) {
  const deck = shuffleCards(createStandardDeck(), random)
  let cursor = 0
  const take = (count) => {
    const cards = deck.slice(cursor, cursor + count)
    cursor += count
    return cards
  }

  return {
    player: {
      hand: take(5),
      drawPile: take(15)
    },
    computer: {
      hand: take(5),
      drawPile: take(15)
    },
    centerPiles: [[take(1)[0]], [take(1)[0]]],
    reservePiles: [take(5), take(5)]
  }
}
