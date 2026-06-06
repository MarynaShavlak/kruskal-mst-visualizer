import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PlaybackView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Алгоритм</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Покроковий плеєр: код з підсвіткою рядків, граф із кольорами компонент і
        ліс DSU з рангами; контролери play/pause/крок. Буде реалізовано у Фазі 3.
      </CardContent>
    </Card>
  )
}
