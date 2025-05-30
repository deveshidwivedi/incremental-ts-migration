import friendlyWords from 'friendly-words'; //declare in .d.ts

export function generateProjectName(): string {
  const adj: string =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  const obj: string =
    friendlyWords.objects[
      Math.floor(Math.random() * friendlyWords.objects.length)
    ];
  return `${adj} ${obj}`;
}

export function generateCollectionName(): string {
  const adj: string =
    friendlyWords.predicates[
      Math.floor(Math.random() * friendlyWords.predicates.length)
    ];
  return `My ${adj} collection`;
}
