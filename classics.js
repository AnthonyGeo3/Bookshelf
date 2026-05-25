// Curated classics list — the candidate pool for the Mystery recommendation on the Bedside view.
//
// Loaded as a regular (non-module) script so `window.CLASSICS` is globally accessible to the
// main module in index.html. Kept in its own file purely to keep edit context smaller — this data
// rarely changes and there's no reason to drag it through every diff of index.html.
//
// To add a new classic, follow the existing shape:
//   { title, author, genres: [...], tone: [...], pace, chapterLength }
//
// Field values MUST come from the chip vocabulary in index.html (Genre/Pace/Tone/Chapter length
// chip groups). Anything else won't match the recommendation scorer and will silently never get
// picked. Cover/pageCount/year/description are fetched live from Google Books at recommendation
// time — no need to include them here.
//
// The scorer excludes books already on the user's shelf or bedside (matched case-insensitively
// by "title|author"). Duplicate titles by different authors are fine.

window.CLASSICS = [
  { title: 'Beloved',                          author: 'Toni Morrison',           genres: ['Literary fiction','Classic'],                            tone: ['Dark','Contemplative','Bleak'],                pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'One Hundred Years of Solitude',    author: 'Gabriel García Márquez',  genres: ['Literary fiction','Classic'],                            tone: ['Contemplative','Playful'],                     pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'Pride and Prejudice',              author: 'Jane Austen',             genres: ['Classic','Romance'],                                     tone: ['Witty','Romantic','Playful'],                  pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Crime and Punishment',             author: 'Fyodor Dostoyevsky',      genres: ['Literary fiction','Classic'],                            tone: ['Dark','Tense','Contemplative'],                pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'Anna Karenina',                    author: 'Leo Tolstoy',             genres: ['Classic','Literary fiction','Romance'],                  tone: ['Contemplative','Romantic'],                    pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'Jane Eyre',                        author: 'Charlotte Brontë',        genres: ['Classic','Romance'],                                     tone: ['Earnest','Tense','Romantic'],                  pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Middlemarch',                      author: 'George Eliot',            genres: ['Classic','Literary fiction'],                            tone: ['Contemplative','Earnest'],                     pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'Great Expectations',               author: 'Charles Dickens',         genres: ['Classic','Literary fiction'],                            tone: ['Earnest','Contemplative'],                     pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Picture of Dorian Gray',       author: 'Oscar Wilde',             genres: ['Classic','Literary fiction','Horror'],                   tone: ['Dark','Witty'],                                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Catch-22',                         author: 'Joseph Heller',           genres: ['Classic','Literary fiction'],                            tone: ['Dark','Witty','Playful'],                      pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Slaughterhouse-Five',              author: 'Kurt Vonnegut',           genres: ['Classic','Sci-fi','Literary fiction'],                   tone: ['Witty','Bleak','Playful'],                     pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'The Old Man and the Sea',          author: 'Ernest Hemingway',        genres: ['Classic','Literary fiction'],                            tone: ['Contemplative','Earnest'],                     pace: 'Slow burn',  chapterLength: 'Short'  },
  { title: 'Of Mice and Men',                  author: 'John Steinbeck',          genres: ['Classic','Literary fiction'],                            tone: ['Bleak','Earnest'],                             pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Things Fall Apart',                author: 'Chinua Achebe',           genres: ['Classic','Literary fiction','Historical fiction'],       tone: ['Earnest','Bleak'],                             pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'The Road',                         author: 'Cormac McCarthy',         genres: ['Literary fiction','Sci-fi'],                             tone: ['Bleak','Dark','Tense'],                        pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'Never Let Me Go',                  author: 'Kazuo Ishiguro',          genres: ['Literary fiction','Sci-fi'],                             tone: ['Contemplative','Bleak'],                       pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Remains of the Day',           author: 'Kazuo Ishiguro',          genres: ['Literary fiction'],                                      tone: ['Contemplative','Bleak'],                       pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Norwegian Wood',                   author: 'Haruki Murakami',         genres: ['Literary fiction'],                                      tone: ['Contemplative','Bleak','Romantic'],            pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Kafka on the Shore',               author: 'Haruki Murakami',         genres: ['Literary fiction'],                                      tone: ['Contemplative','Dark'],                        pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Lincoln in the Bardo',             author: 'George Saunders',         genres: ['Literary fiction','Historical fiction'],                 tone: ['Contemplative','Bleak','Playful'],             pace: 'Slow burn',  chapterLength: 'Short'  },
  { title: '1984',                             author: 'George Orwell',           genres: ['Sci-fi','Classic','Literary fiction'],                   tone: ['Dark','Bleak','Tense'],                        pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Brave New World',                  author: 'Aldous Huxley',           genres: ['Sci-fi','Classic'],                                      tone: ['Dark','Bleak','Contemplative'],                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Fahrenheit 451',                   author: 'Ray Bradbury',            genres: ['Sci-fi','Classic'],                                      tone: ['Dark','Tense','Bleak'],                        pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Foundation',                       author: 'Isaac Asimov',            genres: ['Sci-fi','Classic'],                                      tone: ['Contemplative'],                               pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'Neuromancer',                      author: 'William Gibson',          genres: ['Sci-fi','Classic'],                                      tone: ['Dark','Tense'],                                pace: 'Propulsive', chapterLength: 'Medium' },
  { title: 'The Left Hand of Darkness',        author: 'Ursula K. Le Guin',       genres: ['Sci-fi','Classic','Literary fiction'],                   tone: ['Contemplative'],                               pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Hyperion',                         author: 'Dan Simmons',             genres: ['Sci-fi'],                                                tone: ['Contemplative','Dark'],                        pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'Snow Crash',                       author: 'Neal Stephenson',         genres: ['Sci-fi'],                                                tone: ['Witty','Playful'],                             pace: 'Propulsive', chapterLength: 'Medium' },
  { title: 'The Lord of the Rings',            author: 'J.R.R. Tolkien',          genres: ['Fantasy','Classic'],                                     tone: ['Hopeful','Earnest','Contemplative'],           pace: 'Slow burn',  chapterLength: 'Long'   },
  { title: 'A Wizard of Earthsea',             author: 'Ursula K. Le Guin',       genres: ['Fantasy','Classic'],                                     tone: ['Contemplative','Earnest'],                     pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Name of the Wind',             author: 'Patrick Rothfuss',        genres: ['Fantasy'],                                               tone: ['Contemplative','Tense'],                       pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'American Gods',                    author: 'Neil Gaiman',             genres: ['Fantasy','Literary fiction'],                            tone: ['Dark','Contemplative','Witty'],                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Mistborn: The Final Empire',       author: 'Brandon Sanderson',       genres: ['Fantasy'],                                               tone: ['Tense','Hopeful'],                             pace: 'Propulsive', chapterLength: 'Medium' },
  { title: 'The Big Sleep',                    author: 'Raymond Chandler',        genres: ['Mystery/Thriller','Classic'],                            tone: ['Dark','Witty','Tense'],                        pace: 'Propulsive', chapterLength: 'Short'  },
  { title: 'And Then There Were None',         author: 'Agatha Christie',         genres: ['Mystery/Thriller','Classic'],                            tone: ['Tense','Dark'],                                pace: 'Propulsive', chapterLength: 'Short'  },
  { title: 'Tinker Tailor Soldier Spy',        author: 'John le Carré',           genres: ['Mystery/Thriller','Classic'],                            tone: ['Tense','Contemplative','Bleak'],               pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'The Silence of the Lambs',         author: 'Thomas Harris',           genres: ['Mystery/Thriller','Horror'],                             tone: ['Dark','Tense'],                                pace: 'Propulsive', chapterLength: 'Short'  },
  { title: 'Gone Girl',                        author: 'Gillian Flynn',           genres: ['Mystery/Thriller'],                                      tone: ['Dark','Tense','Witty'],                        pace: 'Propulsive', chapterLength: 'Short'  },
  { title: 'Frankenstein',                     author: 'Mary Shelley',            genres: ['Horror','Sci-fi','Classic'],                             tone: ['Dark','Contemplative','Bleak'],                pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Dracula',                          author: 'Bram Stoker',             genres: ['Horror','Classic'],                                      tone: ['Dark','Tense'],                                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Haunting of Hill House',       author: 'Shirley Jackson',         genres: ['Horror','Classic'],                                      tone: ['Dark','Tense','Contemplative'],                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Shining',                      author: 'Stephen King',            genres: ['Horror'],                                                tone: ['Dark','Tense'],                                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari',  genres: ['Non-fiction','Pop science'],                             tone: ['Contemplative','Witty'],                       pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'A Brief History of Time',          author: 'Stephen Hawking',         genres: ['Pop science','Non-fiction'],                             tone: ['Contemplative'],                               pace: 'Steady',     chapterLength: 'Short'  },
  { title: 'Thinking, Fast and Slow',          author: 'Daniel Kahneman',         genres: ['Non-fiction','Pop science'],                             tone: ['Contemplative'],                               pace: 'Slow burn',  chapterLength: 'Medium' },
  { title: 'Meditations',                      author: 'Marcus Aurelius',         genres: ['Philosophy','Classic','Non-fiction'],                    tone: ['Contemplative','Earnest'],                     pace: 'Slow burn',  chapterLength: 'Short'  },
  { title: "Man's Search for Meaning",         author: 'Viktor E. Frankl',        genres: ['Non-fiction','Philosophy','Biography/Memoir','Classic'], tone: ['Earnest','Contemplative','Bleak','Hopeful'],   pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Body Keeps the Score',         author: 'Bessel van der Kolk',     genres: ['Non-fiction'],                                           tone: ['Contemplative','Earnest'],                     pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'The Vegetarian',                   author: 'Han Kang',                genres: ['Literary fiction'],                                      tone: ['Dark','Contemplative','Bleak'],                pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Convenience Store Woman',          author: 'Sayaka Murata',           genres: ['Literary fiction'],                                      tone: ['Witty','Contemplative','Playful'],             pace: 'Steady',     chapterLength: 'Medium' },
  { title: 'Klara and the Sun',                author: 'Kazuo Ishiguro',          genres: ['Literary fiction','Sci-fi'],                             tone: ['Contemplative','Earnest','Bleak'],             pace: 'Slow burn',  chapterLength: 'Medium' },
];
