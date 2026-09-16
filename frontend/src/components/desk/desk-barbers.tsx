"use client";

import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { Button } from "@/components/ui/button";
import {
  deskBarbers,
  deskCreateBarber,
  deskReorderBarbers,
  deskUpdateBarber,
} from "@/lib/api/desk";
import { text } from "@/lib/shop-format";
import type { DeskBarber } from "@/types/desk";
import { useEffect, useState } from "react";

const empty = {
  nameEn: "",
  nameFa: "",
  titleEn: "",
  titleFa: "",
  bioEn: "",
  bioFa: "",
};

export function DeskBarbers() {
  const { locale, dictionary, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const [rows, setRows] = useState<DeskBarber[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void deskBarbers().then(setRows).catch(fail);
  }, [fail]);

  function startEdit(row?: DeskBarber) {
    if (!row) {
      setEditing("new");
      setForm(empty);
      return;
    }
    setEditing(row.id);
    setForm({
      nameEn: row.name.en,
      nameFa: row.name.fa,
      titleEn: row.title.en,
      titleFa: row.title.fa,
      bioEn: row.bio.en,
      bioFa: row.bio.fa,
    });
  }

  async function save() {
    setBusy(true);
    try {
      if (editing === "new") {
        const created = await deskCreateBarber(form);
        setRows((current) => [...current, created]);
      } else if (editing) {
        const updated = await deskUpdateBarber(editing, form);
        setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      }
      setEditing(null);
      toast(copy.saved);
    } catch {
      fail();
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, delta: number) {
    const next = [...rows];
    const swap = index + delta;
    if (swap < 0 || swap >= next.length) {
      return;
    }
    [next[index], next[swap]] = [next[swap]!, next[index]!];
    setRows(next);
    try {
      setRows(await deskReorderBarbers(next.map((row) => row.id)));
    } catch {
      fail();
      void deskBarbers().then(setRows);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{copy.nav.barbers}</h1>
        <Button size="touch" onClick={() => startEdit()}>
          {copy.add}
        </Button>
      </div>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {rows.map((row, index) => (
          <li key={row.id} className="py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-medium">{text(locale, row.name)}</p>
                <p className="text-sm text-muted-foreground">{text(locale, row.title)}</p>
                {row.active ? null : (
                  <p className="mt-1 text-sm text-muted-foreground">{copy.archived}</p>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => void move(index, -1)}>
                  {copy.reorderUp}
                </Button>
                <Button size="sm" variant="outline" onClick={() => void move(index, 1)}>
                  {copy.reorderDown}
                </Button>
                <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                  {copy.edit}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void deskUpdateBarber(row.id, { active: !row.active })
                      .then((updated) => {
                        setRows((current) =>
                          current.map((item) => (item.id === updated.id ? updated : item)),
                        );
                      })
                      .catch(fail);
                  }}
                >
                  {row.active ? copy.archive : copy.restore}
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {(
            [
              ["nameEn", copy.nameEn],
              ["nameFa", copy.nameFa],
              ["titleEn", copy.titleEn],
              ["titleFa", copy.titleFa],
              ["bioEn", copy.bioEn],
              ["bioFa", copy.bioFa],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              {label}
              {key.startsWith("bio") ? (
                <textarea
                  required
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className={`${deskFieldClass()} h-24 py-3`}
                />
              ) : (
                <input
                  required
                  value={form[key]}
                  dir={key.endsWith("En") ? "ltr" : undefined}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className={deskFieldClass()}
                />
              )}
            </label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <Button size="touch" type="submit" loading={busy}>
              {copy.save}
            </Button>
            <Button size="touch" type="button" variant="outline" onClick={() => setEditing(null)}>
              {copy.cancel}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
