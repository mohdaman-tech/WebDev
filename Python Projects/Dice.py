#User Input
num_dice_input = input("How many (1-6) dice do you want to roll ? ")

num_dice = parse_input(num_dice_input)

def parse_input(input_string):
    if input_string.strip() in {"1", "2", "3", "4", "5", "6"}:
        return int(input_string)
    else:
        print("Please enter a number from 1 to .")
        raise SystemExit(1)
