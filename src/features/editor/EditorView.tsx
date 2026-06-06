import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EditorView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактор графа</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Редактор на React Flow: додавання вершин/ребер з вагою, пресети,
        імпорт/експорт JSON і шаринг через URL-хеш. Буде реалізовано у Фазі 2.
      </CardContent>
    </Card>
  )
}
