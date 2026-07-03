import { select } from "@inquirer/prompts";
import { describe, expect, it, vi } from "vitest";
import { createInquirerSelect } from "../../src/cli/select-prompt.js";

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
  select: vi.fn()
}));

describe("select prompt", () => {
  it("生产上下键菜单一次性展示全部选项", async () => {
    vi.mocked(select).mockResolvedValue("b");

    const selectChoice = createInquirerSelect();
    const result = await selectChoice("请选择流程", [
      {
        label: "A",
        value: "a"
      },
      {
        label: "B",
        value: "b"
      },
      {
        label: "C",
        value: "c"
      }
    ]);

    expect(result).toBe("b");
    expect(select).toHaveBeenCalledWith({
      message: "请选择流程",
      choices: [
        {
          name: "A",
          value: "a"
        },
        {
          name: "B",
          value: "b"
        },
        {
          name: "C",
          value: "c"
        }
      ],
      pageSize: 3
    });
  });
});
