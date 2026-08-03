
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."enum_Sessions_status" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."enum_Skills_type" AS ENUM ('TEACH', 'LEARN');

-- CreateTable
CREATE TABLE "public"."Reviews" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "revieweeId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SequelizeMeta" (
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "public"."Sessions" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "learnerId" UUID NOT NULL,
    "skillId" UUID,
    "topic" VARCHAR(255) NOT NULL,
    "status" "public"."enum_Sessions_status" DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMPTZ(6) NOT NULL,
    "durationMinutes" INTEGER DEFAULT 60,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "meetingLink" VARCHAR(255),

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Skills" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "public"."enum_Skills_type" NOT NULL,
    "category" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "credits" INTEGER DEFAULT 60,
    "bio" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "googleId" VARCHAR(255),
    "avatar" VARCHAR(255),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_sessionId_key" ON "public"."Reviews"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key1" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key10" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key100" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key101" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key102" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key103" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key104" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key105" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key106" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key107" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key108" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key109" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key11" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key110" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key111" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key112" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key113" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key114" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key115" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key116" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key12" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key13" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key14" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key15" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key16" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key17" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key18" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key19" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key2" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key20" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key21" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key22" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key23" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key24" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key25" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key26" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key27" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key28" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key29" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key3" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key30" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key31" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key32" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key33" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key34" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key35" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key36" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key37" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key38" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key39" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key4" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key40" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key41" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key42" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key43" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key44" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key45" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key46" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key47" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key48" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key49" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key5" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key50" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key51" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key52" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key53" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key54" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key55" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key56" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key57" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key58" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key59" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key6" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key60" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key61" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key62" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key63" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key64" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key65" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key66" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key67" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key68" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key69" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key7" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key70" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key71" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key72" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key73" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key74" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key75" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key76" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key77" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key78" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key79" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key8" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key80" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key81" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key82" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key83" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key84" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key85" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key86" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key87" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key88" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key89" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key9" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key90" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key91" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key92" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key93" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key94" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key95" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key96" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key97" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key98" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key99" ON "public"."Users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key1" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key10" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key100" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key101" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key102" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key103" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key104" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key105" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key106" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key107" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key108" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key109" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key11" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key110" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key111" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key112" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key113" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key114" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key12" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key13" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key14" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key15" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key16" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key17" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key18" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key19" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key2" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key20" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key21" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key22" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key23" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key24" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key25" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key26" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key27" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key28" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key29" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key3" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key30" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key31" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key32" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key33" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key34" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key35" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key36" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key37" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key38" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key39" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key4" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key40" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key41" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key42" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key43" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key44" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key45" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key46" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key47" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key48" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key49" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key5" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key50" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key51" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key52" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key53" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key54" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key55" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key56" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key57" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key58" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key59" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key6" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key60" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key61" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key62" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key63" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key64" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key65" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key66" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key67" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key68" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key69" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key7" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key70" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key71" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key72" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key73" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key74" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key75" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key76" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key77" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key78" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key79" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key8" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key80" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key81" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key82" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key83" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key84" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key85" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key86" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key87" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key88" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key89" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key9" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key90" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key91" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key92" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key93" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key94" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key95" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key96" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key97" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key98" ON "public"."Users"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Users_googleId_key99" ON "public"."Users"("googleId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."Sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "Sessions_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "Sessions_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sessions" ADD CONSTRAINT "Sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Skills" ADD CONSTRAINT "Skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

