import spacy

nlp = spacy.load("en_core_web_sm")


def refine_segments(segments):
    refined = []
    for seg in segments:
        doc = nlp(seg)
        for sent in doc.sents:
            if len(sent.text.split()) > 4:
                refined.append(sent.text)
    return refined
