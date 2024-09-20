Id = "Program Id: "
Path = "anchor_id.txt"

def find_str(file_path, find_str) -> str:
    with open(file_path, encoding='utf-8') as f:
        for line in f:
            if line.startswith(find_str):
                line = line.rstrip('\r\n') # 改行文字の削除
                return line
        return ""

def main():
    s = find_str(Path, Id)
    if s == "":
        print("anchor_id.txtに\"Program Id: \"がない")
        exit(1)

    s = s.replace(id, '')

    with open(Path, 'w') as file:
        file.write(s)

main()