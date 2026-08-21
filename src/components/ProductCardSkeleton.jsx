function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-2xl bg-gold/10" />
      <div className="pt-4 flex flex-col gap-2">
        <div className="h-3 w-3/4 bg-gold/10 rounded" />
        <div className="h-3 w-1/3 bg-gold/10 rounded" />
      </div>
    </div>
  )
}

export default ProductCardSkeleton