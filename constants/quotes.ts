export const ambedkarQuotes = [
  "Educate, Agitate, Organize.",
  "I measure the progress of a community by the degree of progress which women have achieved.",
  "Life should be great rather than long.",
  "Cultivation of mind should be the ultimate aim of human existence.",
  "Men are mortal. So are ideas. An idea needs propagation as much as a plant needs watering.",
  "A great man is different from an eminent one in that he is ready to be the servant of the society.",
  "I like the religion that teaches liberty, equality and fraternity.",
  "Lost rights are never regained by appeals to the conscience of the usurpers, but by relentless struggle.",
  "Political tyranny is nothing compared to the social tyranny.",
  "Freedom of mind is the real freedom. A person whose mind is not free though he may not be in chains, is a slave, not a free man.",
  "Be educated, be organised and be agitated.",
  "Democracy is not merely a form of government. It is primarily a mode of associated living, of conjoint communicated experience.",
  "Every man who repeats the dogma of Mill that one country is no fit to rule another country must admit that one class is not fit to rule another class.",
  "For a successful revolution it is not enough that there is discontent. What is required is a profound and thorough conviction of the justice, necessity and importance of political and social rights.",
  "If I find the constitution being misused, I shall be the first to burn it.",
  "Indians today are governed by two different ideologies. Their political ideal set in the preamble of the Constitution affirms a life of liberty, equality and fraternity. Their social ideal embodied in their religion denies them.",
  "Law and order are the medicine of the body politic and when the body politic gets sick, medicine must be administered.",
  "Religion must mainly be a matter of principles only. It cannot be a matter of rules.",
  "The relationship between husband and wife should be one of closest friends.",
  "Unlike a drop of water which loses its identity when it joins the ocean, man does not lose his being in the society in which he lives. Man's life is independent. He is born not for the development of the society alone, but for the development of his self.",
  "The sovereignty of scriptures of all religions must come to an end if we want to have a united integrated modern India.",
  "History shows that where ethics and economics come in conflict, victory is always with economics. Vested interests have never been known to have willingly divested themselves unless there was sufficient force to compel them.",
  "Democracy is not a form of government, but a form of social organisation.",
  "We must stand on our own feet and fight as best as we can for our rights. So carry on your agitation and organise your forces.",
  "I feel that the constitution is workable, it is flexible and it is strong enough to hold the country together both in peacetime and in wartime. Indeed, if I may say so, if things go wrong under the new Constitution, the reason will not be that we had a bad Constitution. What we will have to say is that Man was vile."
];

export const getQuoteOfDay = (): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return ambedkarQuotes[dayOfYear % ambedkarQuotes.length];
};
