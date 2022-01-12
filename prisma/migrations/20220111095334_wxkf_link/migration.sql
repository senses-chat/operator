-- CreateTable
CREATE TABLE "WxkfAccountLink" (
    "id" SERIAL NOT NULL,
    "openKfId" VARCHAR NOT NULL,
    "scene" VARCHAR NOT NULL,
    "scene_param" JSON,
    "url" VARCHAR NOT NULL,

    CONSTRAINT "WxkfAccountLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WxkfAccountLink_url_key" ON "WxkfAccountLink"("url");
