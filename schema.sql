create table public.productos (
  id uuid not null default gen_random_uuid (),
  nombre text not null,
  descripcion text null,
  precio numeric(10, 2) not null,
  cantidad integer not null default 0,
  imagen_url text null,
  vendedor text not null,
  telefono text not null,
  created_at timestamp with time zone null default now(),
  talla text null,
  constraint productos_pkey primary key (id),
  constraint productos_cantidad_check check ((cantidad >= 0)),
  constraint productos_precio_check check ((precio >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_productos_created_at on public.productos using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_productos_precio on public.productos using btree (precio) TABLESPACE pg_default;