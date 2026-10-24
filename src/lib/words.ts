// Small built-in dictionary for the v0.01 heuristic. Deliberately compact and transparent.
export const DICTIONARY = new Set(
  `able act add age ai air all alpha ant app apple arc area arm art ask atom auto baby back bag bake ball band bank bar base bay bean bear beat bee bell best bet big bike bill bird bit black blast block blue boat body bolt bond bone book boom boost box boy brain brand bread bridge bright bro buddy build bull burn bus buy byte cab cafe cake call calm camp can cap car card care cart case cash cast cat chain chair champ chat check chef chip city clan claim class clean clear click cloud club coach coast code coin cold cool core corn cost craft crew crop crowd crypto cube cup cure cut cyber daily dao data date day deal deep degen den desk dev diamond dig dino direct doc dog dollar door dot dream drink drive drop duck dust eagle earn earth easy eat echo edge egg elite energy epic eth event ever exit eye face fact fair fame fan farm fast fat fire first fish fit fix flag flash fleet flex flip flow fly food fork form fox free fresh frog fuel fun fund game gang garden gas gate gear gem get ghost gift girl give glass glow go goat gold golf good grab green grid grow guard guide gym hack hair hand happy hash hat hawk head heal health heart heat help hero high hill hive hold home honey hook hop horse host hot house hub hunt ice idea inc ink iron jet job joy juice jump just key kick kid king kit kitchen lab lake land last law lead leaf learn legal lend lens level life lift light like lime line link lion list live loan lock logic loop love luck lux mad magic mail main make mall man map market mart mask match max meal media meet meme menu meta mind mine mint mix mode money monkey moon more mother motor mountain move movie music name nation nest net news next nft nice night ninja node nova oak ocean offer office oil one open orange orbit pack page paint pal palm pan paper park party pass path pay peak pen people pet phone photo pick pie pig pilot pin pink pixel pizza place plan planet plant play plus pod point pool pop port post pot power press prime pro pump punk pure quest quick race radio rain ranch rare raw ready real red rent rest rich ride ring rise river road robot rock rocket roll roof room root rose royal rush safe sage sail sale salt sand save scale school score sea seed sell send shark shell shift ship shop shot sign silver simple site sky smart smile snap social soft solar sol son soul sound space spark spot star start stock stone store storm street studio style sugar sun super surf swap sweet swift table tag tail talent tank tap task tax tea team tech ten test tide tiger time tip token tool top tour town toy track trade travel tree trend tribe trip true trust truck tube turbo twin up urban value van vault vibe video view villa vip vision vita voice volt vote wall wallet war watch water wave way wealth web weed well whale wild win wind wine wing wise wolf wood work world wow yard yes yoga young zen zero zone pawn shop domain sherpa ganja kush leaf hemp bud chill`.split(/\s+/)
);

/** Try to split a label into 1–3 dictionary words. Returns the parts or null. */
export function splitWords(label: string): string[] | null {
  const s = label.toLowerCase();
  if (DICTIONARY.has(s)) return [s];
  for (let i = 2; i <= s.length - 2; i++) {
    const a = s.slice(0, i);
    const b = s.slice(i);
    if (DICTIONARY.has(a) && DICTIONARY.has(b)) return [a, b];
  }
  for (let i = 2; i <= s.length - 4; i++) {
    const a = s.slice(0, i);
    if (!DICTIONARY.has(a)) continue;
    for (let j = i + 2; j <= s.length - 2; j++) {
      const b = s.slice(i, j);
      const c = s.slice(j);
      if (DICTIONARY.has(b) && DICTIONARY.has(c)) return [a, b, c];
    }
  }
  return null;
}
