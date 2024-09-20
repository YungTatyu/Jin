# 目的　anchor_id.txtからProgram id: ???????????????　の?部分だけを残し、それ以外を削除
# 手順
# 1. 先頭で "Program Id: " の部分を見つける
# 2. 1で見つけた行のみを抜き出す
# 3. 2で抜き出した行から先頭の"Program Id: "を削除
# 4. 最後に改行があると困るので最後の文字が改行である場合に削除


# この関数で手順1と2を行う。
def find_str(file_path, find_str) -> str:
    with open(file_path, encoding='utf-8') as f:
        for line in f:
            if line.startswith(find_str):
                line = line.rstrip('\r\n') # 改行文字の削除
                return line
        return ""

#def remove_str(line, remove_str) -> str:

id = "Program Id: "
path = "anchor_id.txt"

s = find_str(path, id)
if s == "":
    print("anchor_id.txtに\"Program Id: \"がない")
    exit(1)

s = s.replace(id, '')

with open(path, 'w') as file:
    file.write(s)
